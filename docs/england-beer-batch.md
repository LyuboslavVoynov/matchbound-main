# England beer batch — 15 November 2026

Branch: `codex/beer-catalogue-england`, based on merged main `0e943ec`. Adds 20 distinct beers from three English breweries: Timothy Taylor's (7), Theakston (6) and St Austell Brewery (7). Product sources and review expiry (15 February 2027) are recorded in `data/beer-catalogue.england.json`; decisions are in `data/beer-reviews/england.json`. The next five sprint scopes and branches are in `docs/next-five-sprints.md`.

## Sources and decisions

- [Timothy Taylor's current range](https://www.timothytaylor.co.uk/our-beers) establishes Keighley origin and seven current products. Individual beer pages establish the strengths and producer categories. Blonde is the current product name; its former Knowle Spring identity is not counted twice. Landlord and Landlord Dark have different cask/bottle strengths (4.3%/4.1%), as does Boltmaker (4.0%/4.2%). Those three ABVs remain null because a country beer draw does not select a serving format. The source link lets users inspect the producer's specifications.
- [Theakston](https://www.theakstons.co.uk/) establishes Masham, Yorkshire origin. Six individual product sources establish Best Bitter, Lightfoot, XB, Barista Stout, Pale and Quencher. The current [Pale specification](https://www.theakstons.co.uk/pages/pale) gives 4.5%; older trade listings are not used. Lightfoot is explicitly a year-round product despite its seasonal history. Quencher's producer shop establishes its current 3.4% strength.
- [St Austell's breweries](https://www.staustellbrewery.co.uk/our-breweries) establish domestic production in Cornwall and Bristol. All seven selected beer pages label availability year round. [Proper Job](https://www.staustellbrewery.co.uk/our-beers/proper-job) is 4.5% cask/keg and 5.5% bottle/can, so its ABV also remains null. [Anthem](https://www.staustellbrewery.co.uk/our-beers/anthem) currently specifies 3.4%, agreeing with the shop rather than older 3.8% launch material.

GB country code and England origin nation are both retained; Scotland, Wales and Northern Ireland are separate pools. Formats count once. No imported portfolio beers, cider, mixed drinks, limited/seasonal/reserve releases or alcohol-free products are added. No tasting prose or dietary claims are copied. Producer source links establish facts, not artwork rights: these twenty products use the existing Matchbound seal. Selection does not promise local pub or stadium stock; city prices remain independent.

## Verification

Seven focused catalogue tests pass, including combined validation of all 140 product identities, UK nation separation, current strengths and format-dependent null values. TypeScript, scoped ESLint, importer dry run and the existing artwork validator pass. No runtime code, dependency or schema changes are required, so no production build or critic review is needed.

Applied the existing transactional importer successfully:

```sh
npm run beers:import -- data/beer-catalogue.england.json --apply
```

Existing catalogues, legacy brands, city-average prices and saved draw snapshots remain intact. A separate live browser check uses only temporary test-owned draws and deletes them in `finally`:

```sh
ENGLAND_BEER_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.england-beer.config.ts
```

All four live cases passed. The mobile Manchester screenshot was visually inspected. The explicit-origin config starts no server and deploys nothing. It checks one live random country-pool selection in London and a controlled Landlord Dark ticket in Manchester, including the absence of an ambiguous ABV, source links, seal fallback, viewport overflow and persistence after reload on desktop Chromium and iPhone Safari/WebKit. Use the database matching the deployment. Around the Match remains outside this branch.
