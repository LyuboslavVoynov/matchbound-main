import { asc, eq } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { beerBrandCandidates, countryBeerBrands } from "../src/db/schema";

async function main() {
  const db = createDb();
  const candidates = await db.select({ countryCode: countryBeerBrands.countryCode, reviewedBrand: countryBeerBrands.brandName, providerBrewerName: beerBrandCandidates.providerBrewerName, catalogVerified: beerBrandCandidates.providerCatalogVerified, brewerVerified: beerBrandCandidates.providerBrewerVerified, providerLastModified: beerBrandCandidates.providerLastModified, status: beerBrandCandidates.status }).from(beerBrandCandidates).innerJoin(countryBeerBrands, eq(beerBrandCandidates.countryBeerBrandId, countryBeerBrands.id)).orderBy(asc(countryBeerBrands.countryCode));
  console.log(JSON.stringify({ candidates }));
}
main().catch(() => { console.error("Catalog.beer review queue failed."); process.exitCode = 1; });
