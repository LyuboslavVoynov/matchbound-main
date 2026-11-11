# France beer batch — 11 November 2026

Branch: `feat/beer-catalogue-france`, based on merged main `479ad66`. Adds 20 products from three domestic breweries: 3 Monts (10 recipes across its 3 Monts and Du Moulin ranges), Brasserie du Mont Blanc (6) and La Goudale (4). Exact identities, sourced ABVs, supported styles, review dates and expiry are recorded in `data/beer-catalogue.france.json`; source decisions are in `data/beer-reviews/france.json`.

## Source review

- [3 Monts](https://www.3monts.fr/marques/3-monts/) and [Du Moulin](https://www.3monts.fr/marques/du-moulin/): six plus four distinct current recipes from the same French Flanders brewery in Saint-Sylvestre-Cappel. Current Triple is 9.5%; Du Moulin Session IPA is 4.3%. Packaging and brand-range aliases do not inflate the product count. Saison is a named current range product; its formal style stays null because that field was not established by the source.
- [Mont Blanc tasting beers](https://www.brasserie-montblanc.com/bieres-de-degustation/) and [refreshing beers](https://www.brasserie-montblanc.com/bieres-desalterantes/): six individual product pages establish current specifications and the brewery's La Motte-Servolex, France address. La Neipa is 4.7%, Triple Épices 7.2%, and La Cristal is explicitly a 4.7% Pale Ale. Foreign-inspired style names do not change domestic origin. Regional format exclusivity is recorded without claiming local pub availability.
- [La Goudale range](https://brasserie-goudale.com/nos-marques/la-goudale-fr/) and [French brewery](https://brasserie-goudale.com/la-brasserie/): individual pages establish Blonde, Ambrée and IPA at 7.2%, Hop Lager at 5.2%, and Arques production. Conservative producer colour/type labels are preserved rather than imposing unsupported formal classifications.

The older Python TLS client could not connect to Mont Blanc; a modern Node HTTPS client read the public specifications with normal certificate verification. No security check was disabled. La Cristal IPA was left out because its retrieved specification extract did not establish an alcohol value during review.

Only concise factual metadata is recorded. Alcohol-free, mixed-drink and ephemeral/seasonal/aged/reserve editions are excluded, as are imports and non-beer drinks. Formats count once. No marketing text or dietary claims are copied. Source-site display does not grant artwork rights: no logos/photos are downloaded and these products keep the Matchbound seal pending exact approved artwork.

## Verification and import

Seven focused tests, TypeScript, scoped lint, importer dry run and the existing artwork validator pass. Combined validation checks all 120 product identities, while regression cases cover current strengths, La Cristal's sourced type and absent unsupported style data. No runtime, dependency or schema changes are included.

Applied `npm run beers:import -- data/beer-catalogue.france.json --apply` through the existing transactional importer. Read-only verification confirmed 20 approved, active, non-expired products each for France, Germany, Italy, Netherlands, Portugal and Spain. Existing city prices, legacy brands and saved draws are preserved.

Four live browser cases passed against the public app on desktop Chromium and iPhone Safari/WebKit: Paris checks actual French country-pool selection; Marseille uses a controlled long reviewed product name after independently checking its actual French pool. Checks cover the exact source link, sourced ABV, seal fallback, no overflow and unchanged beer after reload. Test-owned draws were cleaned up, and the mobile ticket was visually inspected.

```sh
FRANCE_BEER_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.france-beer.config.ts
```

The explicit-origin config starts no server and deploys nothing. Use the database matching the deployment. No runtime build was repeated for this content-only batch. Vercel reported successful deployment of merged Italy main `479ad66` before this import. The original Around the Match draft remains separate.
