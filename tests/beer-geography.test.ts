import { describe, expect, it } from "vitest";
import { beerCountryCodeFor, beerGeographyFor } from "@/providers/beer-geography";

describe("beer geography", () => {
  it("resolves reviewed display locations to stable keys", () => {
    expect(beerGeographyFor("Germany", "Berlin")).toEqual({ countryCode: "DE", cityId: "berlin-de" });
  });
  it("fails closed for unresolved locations", () => {
    expect(beerGeographyFor("Germany", "Hamburg")).toBeUndefined();
  });
  it("resolves country provenance independently from city-price coverage", () => {
    expect(beerCountryCodeFor("Germany")).toBe("DE");
    expect(beerCountryCodeFor("Unknown")).toBeUndefined();
  });
});
