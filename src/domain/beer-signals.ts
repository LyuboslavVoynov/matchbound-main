import type { DrawResultSnapshot } from "./result";

export type BeerSignalCandidate = Readonly<{
  cityAverage?: Readonly<{ servingLabel: string; averagePriceMinor: number; currency: string; metricDefinition: string; observedAt: Date }>;
  countryBrand?: NonNullable<NonNullable<DrawResultSnapshot["beerSignals"]>["countryBrand"]>;
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
  const countryBrand = candidate.countryBrand && { ...candidate.countryBrand };
  return cityAverage || countryBrand ? { ...(cityAverage && { cityAverage }), ...(countryBrand && { countryBrand }) } : undefined;
}
