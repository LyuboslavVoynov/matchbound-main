import { placeMediaKey, type PlaceMediaSubject } from "@/domain/place-media";

export type PlaceMediaRecord = Readonly<{
  subjectType: PlaceMediaSubject;
  country: string;
  city: string;
  stadium?: string;
  imageUrl: string;
  sourceName: "Wikimedia Commons";
  sourcePageUrl: string;
  author: string;
  licenceName: string;
  licenceUrl: string;
  attribution: string;
  focalPoint: string;
  reviewedAt: string;
}>;

const commonsFile = (fileName: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1600`;
const commonsPage = (fileName: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`;
const cc0 = "https://creativecommons.org/publicdomain/zero/1.0/";
const ccBySa20 = "https://creativecommons.org/licenses/by-sa/2.0/";
const ccBySa40 = "https://creativecommons.org/licenses/by-sa/4.0/";

/**
 * Initial, editorially reviewed backgrounds for the development fixture set.
 * Each record is intentionally explicit; discovery results never publish directly.
 */
export const reviewedPlaceMedia: readonly PlaceMediaRecord[] = [
  { subjectType: "city", country: "England", city: "London", imageUrl: commonsFile("London Skyline in 2025 from Waterloo Bridge.jpg"), sourceName: "Wikimedia Commons", sourcePageUrl: commonsPage("London Skyline in 2025 from Waterloo Bridge.jpg"), author: "Andreas Wolf 01", licenceName: "CC0 1.0", licenceUrl: cc0, attribution: "Andreas Wolf 01 / Wikimedia Commons", focalPoint: "center", reviewedAt: "2026-10-09T00:00:00.000Z" },
  { subjectType: "city", country: "France", city: "Paris", imageUrl: commonsFile("Paris Skyline (210774145).jpeg"), sourceName: "Wikimedia Commons", sourcePageUrl: commonsPage("Paris Skyline (210774145).jpeg"), author: "Gianfranco Albergo", licenceName: "CC0 1.0", licenceUrl: cc0, attribution: "Gianfranco Albergo / Wikimedia Commons", focalPoint: "center", reviewedAt: "2026-10-09T00:00:00.000Z" },
  { subjectType: "city", country: "Spain", city: "Madrid", imageUrl: commonsFile("Madrid - Skyline de Madrid desde el Cerro de San Isidro 1.jpg"), sourceName: "Wikimedia Commons", sourcePageUrl: commonsPage("Madrid - Skyline de Madrid desde el Cerro de San Isidro 1.jpg"), author: "Zarateman", licenceName: "CC0 1.0", licenceUrl: cc0, attribution: "Zarateman / Wikimedia Commons", focalPoint: "center", reviewedAt: "2026-10-09T00:00:00.000Z" },
  { subjectType: "city", country: "Spain", city: "Barcelona", imageUrl: commonsFile("Barcelona Skyline.jpg"), sourceName: "Wikimedia Commons", sourcePageUrl: commonsPage("Barcelona Skyline.jpg"), author: "SGDWN", licenceName: "CC BY-SA 4.0", licenceUrl: ccBySa40, attribution: "SGDWN / Wikimedia Commons / CC BY-SA 4.0", focalPoint: "center", reviewedAt: "2026-10-09T00:00:00.000Z" },
  { subjectType: "stadium", country: "England", city: "London", stadium: "Emirates Stadium", imageUrl: commonsFile("Emirates Stadium.jpg"), sourceName: "Wikimedia Commons", sourcePageUrl: commonsPage("Emirates Stadium.jpg"), author: "An Siarach", licenceName: "Public domain", licenceUrl: "https://creativecommons.org/publicdomain/mark/1.0/", attribution: "An Siarach / Wikimedia Commons", focalPoint: "center", reviewedAt: "2026-10-09T00:00:00.000Z" },
  { subjectType: "stadium", country: "Germany", city: "Dortmund", stadium: "Signal Iduna Park", imageUrl: commonsFile("Signal iduna park.jpg"), sourceName: "Wikimedia Commons", sourcePageUrl: commonsPage("Signal iduna park.jpg"), author: "yasmapaz & ace_heart", licenceName: "CC BY-SA 2.0", licenceUrl: ccBySa20, attribution: "yasmapaz & ace_heart / Wikimedia Commons / CC BY-SA 2.0", focalPoint: "center", reviewedAt: "2026-10-09T00:00:00.000Z" },
  { subjectType: "stadium", country: "Spain", city: "Madrid", stadium: "Santiago Bernabéu", imageUrl: commonsFile("Estadio Santiago Bernabéu - Real Madrid-Real Sociedad.jpg"), sourceName: "Wikimedia Commons", sourcePageUrl: commonsPage("Estadio Santiago Bernabéu - Real Madrid-Real Sociedad.jpg"), author: "Badefa", licenceName: "CC0 1.0", licenceUrl: cc0, attribution: "Badefa / Wikimedia Commons", focalPoint: "center", reviewedAt: "2026-10-09T00:00:00.000Z" },
  { subjectType: "stadium", country: "Spain", city: "Barcelona", stadium: "Camp Nou", imageUrl: commonsFile("Camp Nou - Home Ground of FC Barcelona.jpg"), sourceName: "Wikimedia Commons", sourcePageUrl: commonsPage("Camp Nou - Home Ground of FC Barcelona.jpg"), author: "cp1983 from Pixabay", licenceName: "CC0 1.0", licenceUrl: cc0, attribution: "cp1983 from Pixabay / Wikimedia Commons", focalPoint: "center", reviewedAt: "2026-10-09T00:00:00.000Z" },
];

export function validatePlaceMediaRegistry(records: readonly PlaceMediaRecord[] = reviewedPlaceMedia) {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    const key = placeMediaKey(record.subjectType, record.country, record.city, record.stadium);
    if (seen.has(key)) errors.push(`Duplicate place media key: ${key}`);
    seen.add(key);
    if (record.subjectType === "stadium" && !record.stadium?.trim()) errors.push(`Stadium media is missing a stadium name: ${key}`);
    for (const [label, value] of [["image", record.imageUrl], ["source page", record.sourcePageUrl]] as const) {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" || url.hostname !== "commons.wikimedia.org") errors.push(`Invalid Commons ${label} URL: ${key}`);
      } catch { errors.push(`Invalid ${label} URL: ${key}`); }
    }
    if (!record.author.trim() || !record.attribution.trim() || !record.licenceName.trim() || !record.licenceUrl.trim()) errors.push(`Missing attribution or licence metadata: ${key}`);
  }
  return errors;
}
