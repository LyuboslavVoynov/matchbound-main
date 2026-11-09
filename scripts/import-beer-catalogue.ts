import "dotenv/config";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { beerCatalogueSchema } from "../src/domain/beer-catalogue";
import { beerBreweries, beerProducts } from "../src/db/schema";
async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg.startsWith("--") && arg !== "--apply")) throw new Error("Unknown option");
  const catalogue = beerCatalogueSchema.parse(JSON.parse(await readFile(args.find(arg => !arg.startsWith("--")) ?? "data/beer-catalogue.json", "utf8")));
  console.info(`${catalogue.breweries.length} breweries, ${catalogue.products.length} products validated. ${args.includes("--apply") ? "Applying." : "Dry run; use --apply to import."}`);
  if (!args.includes("--apply")) return;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  const client = postgres(process.env.DATABASE_URL, {max:1});
  try {
    const db = drizzle(client);
    await db.transaction(async tx => {
      for (const brewery of catalogue.breweries) {
        const [existing] = await tx.select().from(beerBreweries).where(eq(beerBreweries.id,brewery.id));
        if (existing && (existing.countryCode !== brewery.countryCode || existing.originNation !== brewery.originNation || existing.name !== brewery.name)) throw new Error("Brewery identity collision");
        await tx.insert(beerBreweries).values(brewery).onConflictDoUpdate({target:beerBreweries.id,set:brewery});
      }
      for (const product of catalogue.products) {
        const [existing] = await tx.select().from(beerProducts).where(eq(beerProducts.id,product.id));
        if (existing && (existing.breweryId !== product.breweryId || existing.normalizedName !== product.normalizedName)) throw new Error("Product identity collision");
        const values = {...product, reviewedAt:new Date(product.reviewedAt),validUntil:new Date(product.validUntil)};
        await tx.insert(beerProducts).values(values).onConflictDoUpdate({target:beerProducts.id,set:values});
      }
    });
    console.info("Catalogue imported atomically; legacy brands and prices preserved.");
  } finally { await client.end(); }
}
main().catch(() => { console.error("Catalogue import failed; check validation, database access and migration 0017."); process.exitCode=1; });
