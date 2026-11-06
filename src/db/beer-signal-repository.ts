import { and, eq, gt } from "drizzle-orm";
import type { Database } from "./client";
import { beerCityPrices, countryBeerBrands } from "./schema";
import { beerCountryCodeFor, beerGeographyFor } from "@/providers/beer-geography";
import { snapshotBeerSignals } from "@/domain/beer-signals";
import { selectRandomFixture } from "@/domain/random";

/** Resolves only reviewed geography and currently-valid records. Missing data never blocks a draw. */
export async function findBeerSignalsForFixture(db: Database, country: string, city: string, now = new Date()) {
  const geography = beerGeographyFor(country, city);
  const countryCode = beerCountryCodeFor(country);
  if (!geography && !countryCode) return undefined;
  const [price, brands] = await Promise.all([
    geography ? db.query.beerCityPrices.findFirst({ columns: { servingLabel: true, averagePriceMinor: true, currency: true, metricDefinition: true, observedAt: true }, where: and(eq(beerCityPrices.countryCode, geography.countryCode), eq(beerCityPrices.cityId, geography.cityId), eq(beerCityPrices.active, true), gt(beerCityPrices.validUntil, now)) }) : undefined,
    countryCode ? db.query.countryBeerBrands.findMany({ columns: { countryName: true, brandName: true, originStatement: true }, where: and(eq(countryBeerBrands.countryCode, countryCode), eq(countryBeerBrands.approvalStatus, "approved"), eq(countryBeerBrands.active, true), gt(countryBeerBrands.validUntil, now)) }) : [],
  ]);
  // The selection happens exactly once, while creating the immutable draw snapshot.
  const brand = selectRandomFixture(brands);
  return snapshotBeerSignals({ cityAverage: price ?? undefined, countryBrand: brand ?? undefined });
}
