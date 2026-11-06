import type { DrawResultSnapshot } from "./result";

export type BeerSignalCandidate = Readonly<{
  cityAverage?: Readonly<{ servingLabel: string; averagePriceMinor: number; currency: string; metricDefinition: string; observedAt: Date }>;
  countryBrand?: Readonly<{ countryName: string; brandName: string; originStatement: string }>;
}>;

/** Converts already-reviewed, currently-valid records into an immutable draw snapshot. */
export function snapshotBeerSignals(candidate: BeerSignalCandidate): DrawResultSnapshot["beerSignals"] {
  const cityAverage = candidate.cityAverage && {
    servingLabel: candidate.cityAverage.servingLabel,
    averagePriceMinor: candidate.cityAverage.averagePriceMinor,
    currency: candidate.cityAverage.currency,
    metricDefinition: candidate.cityAverage.metricDefinition,
    observedAt: candidate.cityAverage.observedAt.toISOString(),
  };
  const countryBrand = candidate.countryBrand && { countryName: candidate.countryBrand.countryName, brandName: candidate.countryBrand.brandName, originStatement: candidate.countryBrand.originStatement };
  return cityAverage || countryBrand ? { ...(cityAverage && { cityAverage }), ...(countryBrand && { countryBrand }) } : undefined;
}
