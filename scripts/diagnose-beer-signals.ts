import { asc, eq } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { beerCityPrices, countryBeerBrands } from "../src/db/schema";

async function main() {
  const db = createDb();
  const now = new Date();
  const [prices, brands, activePrices, activeBrands] = await Promise.all([
    db.select({ countryCode: beerCityPrices.countryCode, cityId: beerCityPrices.cityId, cityName: beerCityPrices.cityName, averagePriceMinor: beerCityPrices.averagePriceMinor, currency: beerCityPrices.currency, servingMl: beerCityPrices.servingMl, observedAt: beerCityPrices.observedAt, validUntil: beerCityPrices.validUntil }).from(beerCityPrices).orderBy(asc(beerCityPrices.countryCode), asc(beerCityPrices.cityId)),
    db.select({ countryCode: countryBeerBrands.countryCode, countryName: countryBeerBrands.countryName, brandName: countryBeerBrands.brandName, validUntil: countryBeerBrands.validUntil }).from(countryBeerBrands).orderBy(asc(countryBeerBrands.countryCode)),
    db.$count(beerCityPrices, eq(beerCityPrices.active, true)),
    db.$count(countryBeerBrands, eq(countryBeerBrands.active, true)),
  ]);
  const usablePriceCount = prices.filter((price) => price.validUntil > now).length;
  const usableBrandCount = brands.filter((brand) => brand.validUntil > now).length;
  console.log(JSON.stringify({ beerCityPrices: prices, countryBeerBrands: brands, activePriceCount: activePrices, activeBrandCount: activeBrands, usablePriceCount, usableBrandCount }));
}

main().catch(() => { console.error("Beer-signal diagnostic failed."); process.exitCode = 1; });
