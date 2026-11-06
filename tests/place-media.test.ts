import { describe, expect, it } from "vitest";
import { placeMediaKey, snapshotPlaceMedia } from "@/domain/place-media";
import { reviewedPlaceMedia, validatePlaceMediaRegistry } from "@/providers/place-media-registry";

describe("reviewed place media", () => {
  it("uses stable, accent-insensitive keys for city and stadium records", () => {
    expect(placeMediaKey("city", "Spain", "Madrid")).toBe("city:spain:madrid");
    expect(placeMediaKey("stadium", "Spain", "Madrid", "Santiago Bernabéu")).toBe("stadium:spain:madrid:santiago-bernabeu");
  });

  it("contains only explicit, Commons-backed reviewed records", () => {
    expect(validatePlaceMediaRegistry()).toEqual([]);
    expect(reviewedPlaceMedia).toContainEqual(expect.objectContaining({ subjectType: "city", city: "London", licenceName: "CC0 1.0" }));
    expect(reviewedPlaceMedia).toContainEqual(expect.objectContaining({ subjectType: "stadium", stadium: "Emirates Stadium" }));
    expect(reviewedPlaceMedia).toContainEqual(expect.objectContaining({ subjectType: "city", country: "Spain", city: "Barcelona" }));
    expect(reviewedPlaceMedia).toContainEqual(expect.objectContaining({ subjectType: "stadium", city: "Barcelona", stadium: "Camp Nou" }));
  });

  it("snapshots only valid stadium media and excludes an untrusted source", () => {
    const city = reviewedPlaceMedia.find((record) => record.subjectType === "city" && record.city === "London")!;
    const stadium = reviewedPlaceMedia.find((record) => record.subjectType === "stadium" && record.stadium === "Emirates Stadium")!;
    expect(snapshotPlaceMedia([city, stadium])).toEqual(expect.objectContaining({ stadium: expect.objectContaining({ attribution: stadium.attribution }) }));
    expect(snapshotPlaceMedia([{ ...city, imageUrl: "https://example.test/unreviewed.jpg" }])).toBeUndefined();
  });
});
