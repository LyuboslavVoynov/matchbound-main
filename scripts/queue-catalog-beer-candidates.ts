import { and, eq } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { beerBrandCandidates, countryBeerBrands } from "../src/db/schema";
import { catalogBeerBrandQueries, findExactCatalogBeerBrewer, searchCatalogBeerBrewers } from "../src/providers/catalog-beer";

async function main() {
  const db = createDb();
  const outcomes: string[] = [];
  for (const mapping of catalogBeerBrandQueries) {
    const [brand] = await db.select({ id: countryBeerBrands.id }).from(countryBeerBrands).where(and(eq(countryBeerBrands.countryCode, mapping.countryCode), eq(countryBeerBrands.brandName, mapping.brandName)));
    if (!brand) throw new Error(`No reviewed country beer brand for ${mapping.countryCode}: ${mapping.brandName}`);
    const candidate = findExactCatalogBeerBrewer(await searchCatalogBeerBrewers(mapping.query), mapping.expectedBrewerName);
    if (!candidate) { outcomes.push(`${mapping.countryCode}: unresolved`); continue; }
    await db.insert(beerBrandCandidates).values({ countryBeerBrandId: brand.id, provider: "catalog.beer", providerBrewerId: candidate.id, providerBrewerName: candidate.name, providerCatalogVerified: candidate.cb_verified, providerBrewerVerified: candidate.brewer_verified, providerLastModified: new Date(candidate.last_modified * 1000), discoveredAt: new Date() }).onConflictDoUpdate({ target: [beerBrandCandidates.countryBeerBrandId, beerBrandCandidates.provider], set: { providerBrewerId: candidate.id, providerBrewerName: candidate.name, providerCatalogVerified: candidate.cb_verified, providerBrewerVerified: candidate.brewer_verified, providerLastModified: new Date(candidate.last_modified * 1000), discoveredAt: new Date() } });
    outcomes.push(`${mapping.countryCode}: queued ${candidate.name}`);
  }
  console.info(outcomes.join("\n"));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Catalog.beer queue failed."); process.exitCode = 1; });
