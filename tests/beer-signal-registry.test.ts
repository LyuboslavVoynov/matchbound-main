import { describe, expect, it } from "vitest";
import { reviewedBeerCityPrices, reviewedCountryBeerBrands, validateBeerSignalRegistry } from "@/providers/beer-signal-registry";

describe("beer signal registry", () => {
  it("contains valid, source-bounded factual records", () => {
    expect(validateBeerSignalRegistry()).toEqual([]);
    expect(reviewedBeerCityPrices).toContainEqual(expect.objectContaining({ countryCode: "DE", cityId: "berlin-de", averagePriceMinor: 490, currency: "EUR", servingMl: 500 }));
    expect(reviewedCountryBeerBrands).toContainEqual(expect.objectContaining({ countryCode: "DE", brandName: "Berliner Pilsner" }));
    expect(reviewedCountryBeerBrands).toContainEqual(expect.objectContaining({ countryCode: "GB", countryName: "England", brandName: "London Pride" }));
    expect(reviewedBeerCityPrices).toContainEqual(expect.objectContaining({ countryCode: "IT", cityId: "milan-it", averagePriceMinor: 600, currency: "EUR" }));
    expect(reviewedCountryBeerBrands).toContainEqual(expect.objectContaining({ countryCode: "ES", brandName: "Mahou" }));
    expect(reviewedCountryBeerBrands).toContainEqual(expect.objectContaining({ countryCode: "FR", brandName: "Kronenbourg" }));
  });

  it("expires the price signal within 90 days of its source update", () => {
    const berlin = reviewedBeerCityPrices[0];
    expect(new Date(berlin.validUntil).getTime() - new Date(berlin.observedAt).getTime()).toBeLessThanOrEqual(90 * 24 * 60 * 60 * 1000);
  });

  it("provides more than one reviewed option for each currently supported country", () => {
    for (const countryCode of ["GB", "DE", "ES", "FR"]) {
      expect(reviewedCountryBeerBrands.filter((brand) => brand.countryCode === countryCode)).toHaveLength(2);
    }
  });
});
