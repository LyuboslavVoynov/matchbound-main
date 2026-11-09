import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { creativeStorageHeaders } from "../src/providers/creative-storage";
import { createDb } from "../src/db/client";
import { creativeAssets, creativePlacements } from "../src/db/schema";
import { creativeObjectKey, creativePublicUrl, creativeSubjectKey, validateCreativeManifest, type CreativeManifest } from "../src/domain/creative-library";

const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
async function main() {
  const apply = process.argv.includes("--apply");
  const manifestPath = process.argv.find(arg => arg.startsWith("--manifest="))?.slice(11) ?? "data/creatives/manifest.json";
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as CreativeManifest;
  const issues = validateCreativeManifest(manifest);
  if (issues.length) throw Error(issues.join("\n"));
  const root = await realpath(process.cwd());
  const prepared = await Promise.all(manifest.assets.filter(a => a.approvalStatus === "approved").map(async asset => {
    const file = await realpath(path.resolve(root, asset.localPath));
    if (!file.startsWith(root + path.sep)) throw Error(`${asset.id}: file escapes project root.`);
    const bytes = await readFile(file);
    if (hash(bytes) !== asset.sha256 || bytes.length !== asset.bytes || bytes.subarray(0,4).toString() !== "RIFF" || bytes.subarray(8,12).toString() !== "WEBP") throw Error(`${asset.id}: local bytes/hash/WebP mismatch.`);
    return { asset, bytes, objectKey: creativeObjectKey(asset) };
  }));
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", approvedFiles: prepared.length, placements: prepared.reduce((n,p) => n+p.asset.placements.length,0), bytes: prepared.reduce((n,p) => n+p.bytes.length,0), pendingFiles: manifest.assets.filter(a => a.approvalStatus === "pending").length }));
  if (!apply || !prepared.length) return;
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY, bucket = process.env.SUPABASE_CREATIVE_BUCKET ?? "matchbound-creatives";
  if (!base || !key || !process.env.DATABASE_URL) throw Error("Publication requires SUPABASE_URL, SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) and DATABASE_URL. No objects or metadata were written.");
  // Validate the entire upload configuration before any mutation.
  for (const p of prepared) creativePublicUrl(base, bucket, p.objectKey);
  const headers = creativeStorageHeaders(key);
  const storageOrigin = new URL(base).origin;
  const bucketResponse = await fetch(`${storageOrigin}/storage/v1/bucket/${bucket}`, { headers, signal: AbortSignal.timeout(15000) });
  if (!bucketResponse.ok) throw Error(`Creative bucket unavailable (HTTP ${bucketResponse.status}). Provision a public image/webp bucket before importing; existing bucket settings are never changed.`);
  const bucketInfo = await bucketResponse.json() as { public?: boolean };
  if (bucketInfo.public !== true) throw Error("Creative bucket must be public; importer will not change existing bucket visibility.");
  const db = createDb();
  try {
    // Fail before uploading if the additive schema has not been applied.
    await db.select({ id: creativeAssets.id }).from(creativeAssets).limit(1);
    for (const { asset, bytes, objectKey } of prepared) {
      const imageUrl = creativePublicUrl(base, bucket, objectKey);
      const response = await fetch(`${storageOrigin}/storage/v1/object/${bucket}/${objectKey}`, { method:"POST",headers:{...headers,"Content-Type":"image/webp","cache-control":"31536000","x-upsert":"false"},body:bytes,signal:AbortSignal.timeout(30000) });
      if (!response.ok && response.status !== 409) throw Error(`${asset.id}: storage upload failed (HTTP ${response.status}).`);
      const verification = await fetch(imageUrl, { cache:"no-store",signal:AbortSignal.timeout(15000) });
      if (!verification.ok || !(verification.headers.get("content-type")??"").startsWith("image/webp") || hash(new Uint8Array(await verification.arrayBuffer())) !== asset.sha256) throw Error(`${asset.id}: public object verification failed; no metadata published.`);
      const publishedAt = new Date();
      await db.transaction(async tx => {
        const record = { id:asset.id, objectKey, imageUrl, contentSha256:asset.sha256, title:asset.title,creator:asset.creator,sourcePageUrl:asset.sourcePageUrl,originalUrl:asset.originalUrl,licenseName:asset.licenseName,licenseUrl:asset.licenseUrl,attribution:asset.attribution,transformationNote:asset.transformationNote,width:asset.width,height:asset.height,bytes:asset.bytes,focalX:asset.focalX,focalY:asset.focalY,approvalStatus:asset.approvalStatus,reviewedAt:new Date(asset.reviewedAt!),reviewNote:asset.reviewNote,publishedAt,active:true };
        const [existing] = await tx.select({ hash: creativeAssets.contentSha256 }).from(creativeAssets).where(eq(creativeAssets.id, asset.id));
        if (existing && existing.hash !== asset.sha256) throw Error(`${asset.id}: immutable asset ID already has different bytes; choose a new versioned ID.`);
        await tx.insert(creativeAssets).values(record).onConflictDoUpdate({target:creativeAssets.id,set:record});
        for (const placement of asset.placements) {
          const mapping = { subjectKey:creativeSubjectKey(placement),subjectType:placement.subjectType,country:placement.country,city:placement.city,stadium:placement.stadium,alt:placement.alt,assetId:asset.id,active:true };
          await tx.insert(creativePlacements).values(mapping).onConflictDoUpdate({target:creativePlacements.subjectKey,set:mapping});
        }
      });
      console.log(JSON.stringify({ id:asset.id, published:true, placements:asset.placements.length }));
    }
  } finally { await db.$client.end(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Creative sync failed."); process.exitCode=1; });
