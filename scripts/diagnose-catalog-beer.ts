import { searchCatalogBeerBrewers } from "../src/providers/catalog-beer";

const reviewedQueries = ["Fuller's", "Berliner Pilsner", "Mahou", "Kronenbourg"];

async function main() {
  const results = await Promise.all(reviewedQueries.map(async (query) => ({ query, matches: (await searchCatalogBeerBrewers(query)).map(({ id, name, cb_verified, brewer_verified, last_modified }) => ({ id, name, catalogVerified: cb_verified, brewerVerified: brewer_verified, lastModified: new Date(last_modified * 1000).toISOString() })) })));
  console.log(JSON.stringify({ provider: "catalog.beer", results }));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Catalog.beer diagnostic failed."); process.exitCode = 1; });
