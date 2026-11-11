# Italy beer batch — 11 November 2026

Branch: `feat/beer-catalogue-italy`, based on merged main `ffa7776`. Adds 20 products from three domestic breweries: Baladin (7), Birrificio del Ducato (9) and Angelo Poretti (4). Exact identities, sourced ABV/styles, review dates and expiry are recorded in `data/beer-catalogue.italy.json`. Decisions and exclusions are in `data/beer-reviews/italy.json`.

## Source review

- [Baladin](https://www.baladin.it/): seven core products, each checked on its brewery product page. The text extractor omits numeric specifications because the page writes them from a public `carString` value. Read the source string and its mapping to the alcohol field without executing scripts; Leön is currently 8.5%. Producer styles and Piozzo/Italian origin remain separate from foreign-inspired beer names or styles.
- [Ducato's current range](https://www.birrificiodelducato.it/birre/) and [history](https://www.birrificiodelducato.it/storia/): nine domestic beers with Soragna production. A.F.O. is now a 4.7% Session IPA, not its old Amber Ale recipe; White Riot is 4%. Individual pages corroborate accessible entries. Machete, Onirika and Futura use the accessible producer range page as their recorded specification source because individual links returned retrieval errors. Chouffe and Duvel imports from the same distributor are excluded.
- [Poretti's Italian range](https://www.birrificioangeloporetti.it/it/birre) and [Carlsberg Italia's history](https://www.carlsbergitalia.it/azienda/carlsberg-italia/la-nostra-storia/): four current recipes with Induno Olona origin. Hop counts are not alcohol percentages. The domestic producer specification for 4 Luppoli L'Originale is 5.0%; do not substitute an older/export retailer value.

Only concise factual metadata is recorded. Formats do not create extra products. Specials, aged/reserve/seasonal/collaboration editions, alcohol-free ranges, Radler/shandy, cider and non-beer drinks are excluded. These are country-level selections, not promises of local pub or stadium stock. No artwork rights are inferred and no images are downloaded; the Matchbound seal remains until exact artwork is approved.

## Verification and import

Seven focused tests, TypeScript, scoped lint, importer dry run and the shared artwork validator pass. Combined manifest validation checks all 100 product identities; changed recipe/strength cases have explicit coverage. There are no runtime, dependency or schema changes.

Applied `npm run beers:import -- data/beer-catalogue.italy.json --apply` through the existing transactional importer. A read-only query confirmed 20 approved, active, non-expired products each for Germany, Italy, Netherlands, Portugal and Spain. Saved draws, legacy brands and independent city prices remain intact.

Four live browser cases passed on desktop Chromium and iPhone-sized Safari/WebKit: Rome checks a real Italian pool selection; Milan uses a controlled long reviewed product name after independently checking its actual Italian pool. Checks cover sourced ABV, the exact source link, seal fallback, no horizontal overflow and unchanged beer after reload. Test-owned draws were cleaned up; the mobile ticket was visually inspected.

```sh
ITALY_BEER_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.italy-beer.config.ts
```

The explicit-origin config starts no server and deploys nothing. Configure the database matching the deployment. No runtime build was repeated for this content-only batch.

## Merged mobile release checkpoint

Before importing this batch, all nine existing mobile-discovery checks passed on the public app after PR #19 merged: 390×664 and 320×568 Safari/WebKit plus desktop Chromium. Calendar reachability, each photo/editorial reveal card and inner-content bounds passed. This is browser-engine testing, not a claim of physical-device testing. The unrelated original Around the Match draft remains separate.
