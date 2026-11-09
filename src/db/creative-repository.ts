import { and, eq, inArray, isNotNull } from "drizzle-orm";
import type { Database } from "./client";
import { creativeAssets, creativePlacements } from "./schema";
import { approvedCreativeUrl, creativePublicUrl, creativeSubjectKey, reusableCreativeLicense, safeHttps } from "@/domain/creative-library";
import { journalVisuals, type JournalVisualSet } from "@/domain/journal-visuals";
import type { DrawResultSnapshot } from "@/domain/result";

const reportedConfigurationIssues = new Set<string>();
function reportConfigurationIssue(reason: string) {
  if (reportedConfigurationIssues.has(reason)) return;
  reportedConfigurationIssues.add(reason);
  console.warn("Creative library configuration issue", { reason });
}

/** Only this server-side lookup reads the new library. Local reviewed files remain the safe rollout fallback. */
export async function findJournalVisuals(db: Database, result: Pick<DrawResultSnapshot, "country" | "city" | "stadium">): Promise<JournalVisualSet> {
  const fallback = journalVisuals(result);
  const base = process.env.SUPABASE_URL;
  if (!base) { reportConfigurationIssue("SUPABASE_URL missing"); return fallback; }
  const bucket = process.env.SUPABASE_CREATIVE_BUCKET ?? "matchbound-creatives";
  try { creativePublicUrl(base, bucket, `journal/config-check/${"0".repeat(64)}.webp`); }
  catch { reportConfigurationIssue("Invalid SUPABASE_URL or SUPABASE_CREATIVE_BUCKET"); return fallback; }
  const subjects = ["country", "city", "stadium"] as const;
  const keys = subjects.map(subjectType => creativeSubjectKey({ subjectType, ...result }));
  try {
    const rows = await db.select({ placement: creativePlacements, asset: creativeAssets }).from(creativePlacements)
      .innerJoin(creativeAssets, eq(creativePlacements.assetId, creativeAssets.id))
      .where(and(inArray(creativePlacements.subjectKey, keys), eq(creativePlacements.active, true), eq(creativeAssets.active, true), eq(creativeAssets.approvalStatus, "approved"), isNotNull(creativeAssets.publishedAt)));
    const output: JournalVisualSet = { ...fallback };
    for (const { asset, placement } of rows) {
      const src = approvedCreativeUrl(asset.imageUrl, base, bucket);
      if (!src) { reportConfigurationIssue("Published image URL does not match configured origin or bucket"); continue; }
      // The key and subject must still agree, even if a bad manual database edit occurs.
      if (!src || asset.approvalStatus !== "approved" || !asset.active || !placement.active || !asset.publishedAt || !asset.reviewedAt || !reusableCreativeLicense(asset.licenseName, asset.licenseUrl) || !safeHttps(asset.sourcePageUrl) || !keys.includes(placement.subjectKey) || placement.subjectKey !== creativeSubjectKey({ subjectType: placement.subjectType, ...result })) continue;
      output[placement.subjectType] = { src, title: asset.title, author: asset.creator, license: asset.licenseName, licenseUrl: asset.licenseUrl, source: asset.sourcePageUrl, original: asset.originalUrl, note: asset.transformationNote, bytes: asset.bytes, alt: placement.alt, position: `${asset.focalX}% ${asset.focalY}%` };
    }
    return output;
  } catch (error) {
    // Artwork is optional after the trip has been loaded. Never block a reveal
    // or saved result because the separate creative-library query failed.
    const cause = error as { cause?: { code?: string }; code?: string };
    const code = cause?.code ?? cause?.cause?.code;
    if (code !== "42P01") console.warn("Creative lookup unavailable; using reviewed local fallback.", { code: typeof code === "string" && /^[0-9A-Z]{5}$/.test(code) ? code : "unknown" });
    return fallback;
  }
}
