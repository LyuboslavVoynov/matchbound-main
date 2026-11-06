import { createDb } from "../src/db/client";
import { beerCityPrices, countryBeerBrands } from "../src/db/schema";
import { reviewedBeerCityPrices, reviewedCountryBeerBrands, validateBeerSignalRegistry } from "../src/providers/beer-signal-registry";

async function main() {
  const errors = validateBeerSignalRegistry();
  if (errors.length) throw new Error(`Beer signal registry validation failed:\n${errors.join("\n")}`);
  const db = createDb();
  for (const record of reviewedBeerCityPrices) {
    await db.insert(beerCityPrices).values({ ...record, observedAt: new Date(record.observedAt), reviewedAt: new Date(record.reviewedAt), validUntil: new Date(record.validUntil), active: true }).onConflictDoUpdate({
      target: [beerCityPrices.countryCode, beerCityPrices.cityId],
      set: { cityName: record.cityName, averagePriceMinor: record.averagePriceMinor, currency: record.currency, servingMl: record.servingMl, servingLabel: record.servingLabel, metricDefinition: record.metricDefinition, sourceName: record.sourceName, sourceUrl: record.sourceUrl, observedAt: new Date(record.observedAt), reviewedAt: new Date(record.reviewedAt), validUntil: new Date(record.validUntil), active: true },
    });
  }
  for (const record of reviewedCountryBeerBrands) {
    await db.insert(countryBeerBrands).values({ ...record, approvalStatus: "approved", reviewedAt: new Date(record.reviewedAt), validUntil: new Date(record.validUntil), active: true }).onConflictDoUpdate({
      target: [countryBeerBrands.countryCode, countryBeerBrands.brandName],
      set: { countryName: record.countryName, originStatement: record.originStatement, sourceName: record.sourceName, sourceUrl: record.sourceUrl, reviewedAt: new Date(record.reviewedAt), validUntil: new Date(record.validUntil), approvalStatus: "approved", active: true },
    });
  }
  console.info(`Seeded ${reviewedBeerCityPrices.length} beer city price(s) and ${reviewedCountryBeerBrands.length} country beer brand(s).`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
