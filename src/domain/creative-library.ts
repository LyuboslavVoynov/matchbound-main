export type CreativeSubject = "country" | "city" | "stadium";
export type CreativePlacement = { subjectType: CreativeSubject; country: string; city?: string; stadium?: string; alt: string };
export type CreativeManifestAsset = {
  id: string; localPath: string; title: string; creator: string; sourcePageUrl: string; originalUrl: string;
  licenseName: string; licenseUrl: string; attribution: string; transformationNote: string;
  sha256: string; width: number; height: number; bytes: number; focalX: number; focalY: number;
  approvalStatus: "pending" | "approved" | "rejected"; reviewedAt?: string; reviewNote?: string; placements: CreativePlacement[];
};
export type CreativeManifest = { version: 1; assets: CreativeManifestAsset[] };
const normalized = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
/** JSON tuples avoid ambiguous separators and never perform fuzzy venue matching. */
export function creativeSubjectKey(p: Pick<CreativePlacement, "subjectType" | "country" | "city" | "stadium">) {
  const fields = [p.subjectType, normalized(p.country)];
  if (p.subjectType !== "country") fields.push(normalized(p.city ?? ""));
  if (p.subjectType === "stadium") fields.push(normalized(p.stadium ?? ""));
  return JSON.stringify(fields);
}
export function safeHttps(value: string): boolean {
  try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; }
}
/** Only freely reusable licences explicitly reviewed for this collection are imported. */
export function reusableCreativeLicense(name: string, url: string): boolean {
  const match = /^(CC BY(?:-SA)?) ([1-4]\.0)$/.exec(name);
  if (name === "CC0") return /^https:\/\/creativecommons\.org\/publicdomain\/zero\/1\.0(?:\/|$)/.test(url);
  if (!match) return false;
  const kind = match[1] === "CC BY-SA" ? "by-sa" : "by";
  return url.startsWith(`https://creativecommons.org/licenses/${kind}/${match[2]}/`) || url === `https://creativecommons.org/licenses/${kind}/${match[2]}`;
}
export function validateCreativeManifest(manifest: CreativeManifest): string[] {
  const issues: string[] = []; const ids = new Set<string>(); const placements = new Set<string>();
  if (manifest.version !== 1 || !Array.isArray(manifest.assets)) return ["Unsupported creative manifest."];
  for (const a of manifest.assets) {
    const fail = (message: string) => issues.push(`${a.id}: ${message}`);
    if (!/^[a-z0-9][a-z0-9-]{2,99}$/.test(a.id) || ids.has(a.id)) fail("unique lowercase asset ID required"); ids.add(a.id);
    if (!/^[a-f0-9]{64}$/.test(a.sha256)) fail("SHA-256 required");
    if (!a.localPath.endsWith(".webp") || a.localPath.startsWith("/") || a.localPath.split(/[\\/]/).includes("..")) fail("relative WebP path required");
    if (!a.title.trim() || !a.creator.trim() || !a.attribution.trim() || !a.transformationNote.trim()) fail("complete attribution required");
    if (!safeHttps(a.sourcePageUrl) || !safeHttps(a.originalUrl) || !reusableCreativeLicense(a.licenseName, a.licenseUrl)) fail("reviewed HTTPS source and reusable licence required");
    if (![a.width, a.height, a.bytes].every(n => Number.isInteger(n) && n > 0) || a.bytes > 6_000_000) fail("valid dimensions and a <=6MB optimized file required");
    if (![a.focalX, a.focalY].every(n => Number.isInteger(n) && n >= 0 && n <= 100)) fail("focal point must be 0–100");
    if (!["pending", "approved", "rejected"].includes(a.approvalStatus)) fail("invalid approval status");
    if (a.approvalStatus === "approved" && (!a.reviewedAt || !Number.isFinite(Date.parse(a.reviewedAt)) || !a.reviewNote?.trim())) fail("approval requires dated subject/licence/crop review");
    if (!a.placements.length) fail("at least one placement required");
    for (const p of a.placements) {
      if (!p.country.trim() || !p.alt.trim() || !["country", "city", "stadium"].includes(p.subjectType) || (p.subjectType !== "country" && !p.city?.trim()) || (p.subjectType === "stadium" && !p.stadium?.trim())) fail("complete exact destination placement required");
      const key = creativeSubjectKey(p);
      if (a.approvalStatus === "approved" && placements.has(key)) fail(`multiple approved images target ${key}`);
      if (a.approvalStatus === "approved") placements.add(key);
    }
  }
  return issues;
}
export function creativeObjectKey(a: Pick<CreativeManifestAsset, "id" | "sha256">) { return `journal/${a.id}/${a.sha256}.webp`; }
export function creativePublicUrl(base: string, bucket: string, key: string) {
  const u = new URL(base);
  if (u.protocol !== "https:" || u.username || u.password || u.pathname !== "/" || u.search || u.hash || !/^[a-z0-9][a-z0-9-]{2,62}$/.test(bucket) || !/^journal\/[a-z0-9-]+\/[a-f0-9]{64}\.webp$/.test(key)) throw Error("Invalid creative storage configuration.");
  return `${u.origin}/storage/v1/object/public/${bucket}/${key}`;
}
export function approvedCreativeUrl(value: string | null, storageBase: string | undefined, bucket: string): string | undefined {
  if (!value || !storageBase) return undefined;
  try {
    const url = new URL(value), base = new URL(storageBase);
    if (!safeHttps(value) || url.origin !== base.origin || url.search || url.hash) return undefined;
    const prefix = `/storage/v1/object/public/${bucket}/`;
    if (!url.pathname.startsWith(prefix)) return undefined;
    const key = url.pathname.slice(prefix.length);
    return creativePublicUrl(base.origin, bucket, key) === value ? value : undefined;
  } catch { return undefined; }
}
