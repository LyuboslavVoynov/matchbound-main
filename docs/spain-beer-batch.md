# Spain beer batch — source review 10 November, live verification 11 November 2026

Branch: `feat/beer-catalogue-spain`, based on merged main `ba0c739`. Adds 20 products from four domestic producers: Mahou (8), Alhambra (4), Moritz (4) and Estrella Galicia / Hijos de Rivera (4). Names, sourced styles/ABVs, review dates, expiry and exact product identities are recorded in `data/beer-catalogue.spain.json`. Detailed decisions and exclusions are in `data/beer-reviews/spain.json`.

## Source review

- [Mahou San Miguel producer catalogue](https://www.mahou-sanmiguel.com/es-es/nuestras-marcas) and individual official store pages establish the eight Mahou formulations. Manufacturer information lists Madrid, Spain. Different pack/bottle sizes are counted once; Sin Gluten and Sin Filtrar are distinct formulations. Mixed-portfolio imports are excluded.
- [Alhambra's current range](https://www.cervezasalhambra.com/es/nuestras-cervezas) and individual brewery pages establish four beers and Granada origin. Reserva Roja is one product; Citra IPA uses the brewery specification of 6.5% ABV. Its redirected shop link was not used as a specification.
- [Moritz's current range](https://moritz.com/en/moritz-classic-beers) and individual producer-store specifications establish four beers. Moritz 7 is 5.5%, not 7%; Bruta Unfiltered is 5.6%. Production origin is Spain; no claim is made that every bottle is brewed in a particular city.
- [Estrella Galicia Especial](https://estrellagalicia.es/producto/estrella-galicia/) and the [official 1906 shop](https://bigcrafters.com/collections/marca-cervezas-1906) establish four beers and the manufacturer in A Coruña, Spain. Current 1906 La Milnueve is stored once rather than duplicated under its former Reserva Especial name. The producer's indexed public training catalogue corroborates technical styles; a failed direct retrieval is recorded honestly in the source decisions.

Concise factual metadata only: no copied marketing descriptions, price promises, local pub availability claims or dietary advice. Alcohol-free/low-alcohol lines, Radler/shandy, collaborations, numbered/barrel/secret editions, cider and imported portfolio products are excluded. Factual source pages grant no artwork reuse rights. No new logos or photos are included; all 20 products retain the Matchbound seal.

## Verification and import

Seven focused tests, TypeScript, scoped lint and importer dry run passed. Tests check collisions across all 80 products, current strengths and duplicate aliases. Only test typing required correction; runtime code and schema are unchanged.

Applied `npm run beers:import -- data/beer-catalogue.spain.json --apply` through the existing transactional importer on 11 November. A read-only count then confirmed 20 approved, active, non-expired products each for Germany, Portugal, Netherlands and Spain. Existing brands, prices and saved draws were preserved.

Four live browser cases passed against the public app on desktop/mobile: Madrid uses a real country-scoped random selection; Barcelona uses a controlled long reviewed product name after independently checking its actual Spanish draw pool. Checks cover the source link, sourced ABV, seal fallback, wrapping/no overflow and unchanged beer after reload. Test-owned draws were cleaned up. No runtime build was repeated for this content-only batch.

```sh
SPAIN_BEER_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.spain-beer.config.ts
```

The explicit-origin config starts no server and deploys nothing. Use the database matching the chosen deployment. Original Around the Match changes remain separate.
