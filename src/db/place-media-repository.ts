import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "./client";
import { placeMedia } from "./schema";
import { placeMediaKey, type ReviewedPlaceMedia } from "@/domain/place-media";

export async function findPlaceMediaForFixture(db: Database, country: string, city: string, stadium: string): Promise<ReviewedPlaceMedia[]> {
  const stadiumKey = placeMediaKey("stadium", country, city, stadium);
  const rows = await db.select({
    subjectType: placeMedia.subjectType, imageUrl: placeMedia.imageUrl, sourceName: placeMedia.sourceName, sourcePageUrl: placeMedia.sourcePageUrl,
    author: placeMedia.author, licenceName: placeMedia.licenceName, licenceUrl: placeMedia.licenceUrl, attribution: placeMedia.attribution, focalPoint: placeMedia.focalPoint,
  }).from(placeMedia).where(and(eq(placeMedia.active, true), inArray(placeMedia.subjectKey, [stadiumKey])));
  return rows as ReviewedPlaceMedia[];
}
