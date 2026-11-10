# Sprint 7 — product artwork

Branch: feat/beer-artwork-library. The existing three legacy brand marks remain available for older snapshots. Product snapshots now require an approved exact product-ID/country mapping; they cannot inherit an unrelated legacy mark by display-name coincidence.

The first batch contains two licensed product photographs: Augustiner Edelstoff (Kompakt) and Krombacher Pils (Rjh1962), both CC BY-SA 3.0. These are whole photographs, not newly approved logos. They show historical packaging/glassware; the source, creator, licence and resize/compression note are available beside the ticket. The other 18 German products keep the Matchbound seal. Portugal's catalogue can merge independently and keeps its seal until exact product artwork is reviewed.

Run: npx tsx scripts/validate-beer-artwork.ts . The report lists product IDs still needing artwork. For each, verify the exact product depicted, source/creator, reusable rights and credits, then keep the file under public/beer/products and record its hash. A brewery product page is a factual source, not automatic permission to reuse its graphics. CC BY/CC BY-SA/CC0 metadata uses the existing shared licence gate. Public-domain or permission-specific artwork needs an explicit evidence model before this stricter new manifest accepts it.

Migration 0018 adds the RLS-enabled beer_product_artwork mapping table. It was applied once to the shared database on 10 November 2026. Both photographs were uploaded with immutable storage keys and downloaded to verify their hashes, then mapped through the strict additive importer. The publication manifest has no geographic placements: beer photos cannot become city or ground imagery.

Publication commands: `npm run creatives:sync -- --asset-only --manifest=data/creatives/beer-artwork-manifest.json --apply`, then `npm run beer-artwork:import -- --apply`. Dry-run is the default. Reviewed assets use versioned v1 IDs; a later replacement must explicitly version its mapping/import rather than overwrite published bytes.

The server checks exact product/country, approval, publication and configured storage origin. Artwork resolves separately from the immutable beer draw; missing tables, configuration, records or images preserve a usable ticket and its original selection. The browser receives only public artwork metadata. Build-time validation checks reviewed local bytes and catalogue identity.

Verification: 16 focused unit tests, TypeScript, scoped lint and production build passed. Six existing ticket browser cases and four new exact-photo cases passed across desktop/mobile, including source credits, reload persistence and simulated image failure. The mobile photo ticket was visually inspected. One independent read-only Product Critic review found no important issue. No wheel or extra reveal controls were added.
