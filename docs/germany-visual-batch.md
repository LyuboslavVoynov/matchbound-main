# Germany visual sprint

Branch: `codex/visual-coverage-germany`, based on main `0e943ec`.

## Baseline, 15 November 2026

The existing approved geographic manifest has no exact Germany city or stadium placements. The checked-in BL1 inventory contains 18 distinct cities and 18 distinct stadiums. This is local manifest coverage, not a claim about production bucket contents or current selectable fixtures.

Generated `data/creatives/bl1-sourcing/queue.json` with the existing missing-subject queue tool. The queue is research-only: no candidate is approved, uploaded or served merely because it appears there.

```sh
npx tsx scripts/queue-creative-sources.ts --league=BL1 --output=data/creatives/bl1-sourcing/queue.json
npx tsx scripts/creative-coverage.ts
```

## Source review priorities

Verify the inventory against current fixture venues before approving placements. In particular, the Hoffenheim row uses Zuzenhausen with PreZero Arena: a town landmark must not be mistaken for the ground's location. Stadium aliases such as Mercedes-Benz Arena also require identity checks rather than name-only source matching. Preserve exact runtime keys until any correction is independently established.

Start with Munich/Allianz Arena, Dortmund/Signal Iduna Park and Cologne/RheinEnergieSTADION, then work through the remaining selectable destinations. Each asset needs a verified photographic subject, author, reusable licence, source page, source date, image bytes, dimensions, hash and responsive focal point. Keep provenance and derivative licence notes in the existing manifest format. Reject models, maps, unrelated grounds and ambiguous release permissions.

## First published batch

Published six reviewed photographs: Munich's New Town Hall and Allianz Arena, Dortmund's Reinoldikirche and Signal Iduna Park, Cologne Cathedral and RheinEnergieSTADION. Exact sources, authors, dates, licences, hashes and placements are recorded in `data/creatives/bl1-sourcing/reviewed.json` and the shared manifest. Original candidate metadata remains discovery history, not an approval list. All derivatives retain their source CC BY-SA licence; credits are accessible in the existing product UI.

The Allianz Arena photograph shows historical blue illumination in 2009; it is not presented as current club branding. Dortmund's church photograph records the 2015 Christmas market. A similarly named candidate showing a church organ was rejected before inclusion. No anonymous search-result thumbnails or inferred artwork permissions were used.

The transactional importer published all six assets to immutable keys and downloaded each public WebP to verify its hash before metadata publication. Dry run: six files, six placements, 1,457,948 bytes. Fourteen focused creative-library, repository and sourcing tests, TypeScript and scoped ESLint passed. Live browser verification covers each city reveal and ground background, image decoding, credits, country beer and saved-ticket reload on desktop Chromium and iPhone Safari/WebKit; temporary test-owned draws are deleted in `finally`.

Portrait landmarks use top-aligned focal points to preserve their spires. The storage service returned HTTP 400 on attempted re-upload of an existing immutable object; original publication and hashes were already verified. The three existing city objects were independently downloaded and hash-checked again before updating only their database focalY fields. No bytes or storage policies were overwritten. The existing importer's duplicate-response handling is a separate tooling follow-up.

This is the first Germany batch, not full-country completion: three of 18 cities and three of 18 stadiums now have approved exact placements. The regenerated research queue retains 30 missing subjects. Existing editorial fallbacks remain for those gaps. No runtime/dependency/schema changes or automatic merge; Around the Match is excluded.

```sh
CONTENT_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.germany-visuals.config.ts
```
