import { createDb } from "../src/db/client";
import { placeMedia } from "../src/db/schema";
import { placeMediaKey } from "../src/domain/place-media";
import { reviewedPlaceMedia, validatePlaceMediaRegistry } from "../src/providers/place-media-registry";

async function main() {
  const errors = validatePlaceMediaRegistry();
  if (errors.length) throw new Error(`Place media registry validation failed:\n${errors.join("\n")}`);
  const db = createDb();
  for (const record of reviewedPlaceMedia) {
    const subjectKey = placeMediaKey(record.subjectType, record.country, record.city, record.stadium);
    await db.insert(placeMedia).values({ ...record, subjectKey, reviewedAt: new Date(record.reviewedAt), active: true }).onConflictDoUpdate({
      target: [placeMedia.subjectType, placeMedia.subjectKey],
      set: { country: record.country, city: record.city, stadium: record.stadium ?? null, imageUrl: record.imageUrl, sourceName: record.sourceName, sourcePageUrl: record.sourcePageUrl, author: record.author, licenceName: record.licenceName, licenceUrl: record.licenceUrl, attribution: record.attribution, focalPoint: record.focalPoint, reviewedAt: new Date(record.reviewedAt), active: true },
    });
  }
  console.info(`Seeded ${reviewedPlaceMedia.length} reviewed place-media record(s).`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
