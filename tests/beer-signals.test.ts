import { describe, expect, it } from "vitest";
import { snapshotBeerSignals } from "@/domain/beer-signals";

describe("beer signal snapshots", () => {
  it("captures only the factual values needed by a stable shared draw", () => {
    expect(snapshotBeerSignals({ cityAverage: { servingLabel: "0.5 L draft beer", averagePriceMinor: 490, currency: "EUR", metricDefinition: "2026 Berlin average", observedAt: new Date("2026-08-29T00:00:00Z") }, countryBrand: { countryName: "Germany", brandName: "Berliner Pilsner", originStatement: "Founded in East Berlin in 1963." } })).toEqual({ cityAverage: { servingLabel: "0.5 L draft beer", averagePriceMinor: 490, currency: "EUR", metricDefinition: "2026 Berlin average", observedAt: "2026-08-29T00:00:00.000Z" }, countryBrand: { countryName: "Germany", brandName: "Berliner Pilsner", originStatement: "Founded in East Berlin in 1963." } });
  });
  it("allows either independent signal to be absent", () => {
    expect(snapshotBeerSignals({ countryBrand: { countryName: "England", brandName: "London Pride", originStatement: "From Chiswick, London." } })).toEqual({ countryBrand: { countryName: "England", brandName: "London Pride", originStatement: "From Chiswick, London." } });
    expect(snapshotBeerSignals({})).toBeUndefined();
  });
});
