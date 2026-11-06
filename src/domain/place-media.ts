import type { DrawResultSnapshot } from "./result";

export type PlaceMediaSubject = "city" | "stadium";

/** Stable, human-readable keys allow a snapshot to survive venue record changes. */
export function placeMediaKey(subject: PlaceMediaSubject, country: string, city: string, stadium?: string) {
  const normalise = (value: string) => value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [subject, normalise(country), normalise(city), ...(subject === "stadium" && stadium ? [normalise(stadium)] : [])].join(":");
}

export type ReviewedPlaceMedia = Readonly<{
  subjectType: PlaceMediaSubject;
  imageUrl: string;
  sourceName: string;
  sourcePageUrl: string;
  author: string;
  licenceName: string;
  licenceUrl: string;
  attribution: string;
  focalPoint: string;
}>;

/** Only an explicit HTTPS Commons image and source page can become a reveal image. */
export function snapshotPlaceMedia(media: readonly ReviewedPlaceMedia[]): DrawResultSnapshot["placeMedia"] | undefined {
  const safe = (item: ReviewedPlaceMedia) => {
    try {
      const image = new URL(item.imageUrl);
      const source = new URL(item.sourcePageUrl);
      const licence = new URL(item.licenceUrl);
      return image.protocol === "https:" && image.hostname === "commons.wikimedia.org" && source.protocol === "https:" && source.hostname === "commons.wikimedia.org" && licence.protocol === "https:";
    } catch { return false; }
  };
  const stadium = media.find((item) => item.subjectType === "stadium");
  const toSnapshot = (item: ReviewedPlaceMedia | undefined) => item && safe(item) ? ({ imageUrl: item.imageUrl, sourceName: item.sourceName, sourcePageUrl: item.sourcePageUrl, author: item.author, licenceName: item.licenceName, licenceUrl: item.licenceUrl, attribution: item.attribution, focalPoint: item.focalPoint }) : undefined;
  const snapshot = { stadium: toSnapshot(stadium) };
  return snapshot.stadium ? snapshot : undefined;
}
