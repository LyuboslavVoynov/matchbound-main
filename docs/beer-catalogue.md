# Reviewed beer product catalogue

Branch: `feat/beer-catalogue`, based on `sprint/01-release-integration`.

The initial Germany pilot contains **20 distinct products from five breweries**, not 20 umbrella brands. It is intentionally a country pool, not a claim that a particular pub stocks the beer. Brewery sources were reviewed on 9 November 2026; records expire after six months. Names and origin are reviewed, while unsupported style and alcohol facts remain null. Eight products currently include ABV from the brewery's published product information.

Primary sources are recorded on every product in `data/beer-catalogue.json`: Augustiner's beer list, Paulaner's product overview, Weihenstephaner's beer list, Erdinger's product information, and Krombacher's international product list. Short product names and factual alcohol values are stored; brewery marketing descriptions are not copied.

## Import and database

- `npm run beers:import` validates without database writes.
- `npm run beers:import -- --apply` imports transactionally after migration 0017.
- `npx tsx scripts/apply-beer-pilot.ts` applies only migration 0017 and records its checksum in the existing Drizzle journal. This is for the existing shared database, whose earlier migrations are already applied. Normal new deployments use the full migration workflow.
- `npx tsx scripts/verify-beer-pilot.ts` checks live counts, RLS, product selection and the legacy fallback without printing credentials.

Both new tables have RLS enabled and no public write policies. Application reads use the existing server database connection. Imports never delete the legacy country brands, candidate queues, prices, or saved results. Stable IDs cannot be reassigned to another product/brewery; duplicate product names within a brewery fail validation.

The pilot migration and import were applied to the configured Supabase project. Live verification found 20 approved active products / five breweries and RLS enabled on both tables. Reimporting the same manifest is safe.

## Draw and ticket behavior

Only active, approved, unexpired products with matching country **and origin nation** enter a draw. England, Wales, Scotland and Northern Ireland have separate provenance despite sharing GB. Products have equal selection probability. A country with a product pool uses that pool without also mixing in legacy brands. Missing catalogue tables or optional enrichment failures fall back to legacy records or no beer; fixture selection still works.

Selection is made once when saving the draw. Product ID, brewery, source and any known facts are copied into its immutable result snapshot. Opening/reloading/sharing a ticket does not select again. Older snapshots keep working. ABV is an integer in hundredths of a percent (530 = 5.3%); null means unknown, not alcohol-free.

Existing exact-match local artwork is retained. **The 20 new products do not yet have cleared product logos.** They use the existing Matchbound seal until product-specific artwork with source, creator, licence and reuse approval is added. A website showing a logo does not by itself grant permission to copy it. No product is given another beer's logo. Shared image infrastructure remains separate from this catalogue import.

Next batches: expand the remaining supported countries, add reviewed style/ABV facts, and source permitted product artwork. Country coverage is not yet complete.
