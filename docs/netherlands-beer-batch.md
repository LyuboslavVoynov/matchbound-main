# Netherlands beer batch — 10 November 2026

Branch: `feat/beer-catalogue-netherlands`, based on merged main `d629d05`. The additive manifest contains 20 Dutch products: eight from Brouwerij 't IJ, seven from Texels and five from La Trappe. Each product has a sourced alcohol value, review date, expiry and an exact identity. Country-level selection does not promise availability at a particular stadium, pub or shop.

## Source review

- [Brouwerij 't IJ permanent range](https://www.brouwerijhetij.nl/onze-bieren): the eight selected products have individual brewery product pages. Use current strengths, including 't Gouden IJ 6.8%, NIJPA 6.2% and Blondie 5.8%. [Brewery contact locations](https://www.brouwerijhetij.nl/contact) establish Amsterdam origin.
- [Texels range](https://www.texels.nl/bieren): seven named products have individual brewery product pages. Zeebries and Tuunwal Tripel are current names, not extra entries alongside their former Blond/Tripel aliases. [The brewery](https://www.texels.nl/over-de-brouwerij/over-texelse-bierbrouwerij) reports island and mainland production; no claim is made that all bottles are brewed on Texel.
- [International Trappist Association producer listing](https://www.trappist.be/en/products/beers/la-trappe/): primary association source for the five La Trappe products and ABVs. Its [abbey directory](https://www.trappist.be/en/abbeys/) places Koningshoeven in Berkel-Enschot, Netherlands. The brewery website returned an age gate, which was not treated as a specification. No individual product URL was guessed; unsupported style fields remain null.

Only concise product facts are recorded; marketing descriptions are not copied. Alcohol-free products, seasonal/occasional releases, collaborations, secret batches and varying-strength aged editions are excluded. Product source pages do not grant artwork rights: these 20 products retain the Matchbound seal, and no logos or photos are downloaded in this batch.

## Verification and publication

Seven focused tests pass, including collision checks across all three country manifests and regression checks for current strengths/renamed products. TypeScript, scoped lint, importer dry run and the shared artwork validator pass; the latter now sees 60 catalogue products and two approved photos. No application runtime or schema changes are needed.

Applied `npm run beers:import -- data/beer-catalogue.netherlands.json --apply` through the existing transactional importer. Database verification returned 20 approved, active, non-expired products each for Germany, Portugal and Netherlands. Existing legacy brands, prices and saved draws are preserved.

Eight live desktop/mobile content browser cases pass after import: Amsterdam, Utrecht, Leeuwarden and Rio Maior. They verify country-scoped product IDs, sourced ABV, seal fallback, saved selection after reload, exact destination imagery and no horizontal overflow. Test-owned draws were cleaned up.

Repeat: `CONTENT_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.content.config.ts` with the deployment's matching database configured locally. No build was repeated because this batch changes content and verification only.
