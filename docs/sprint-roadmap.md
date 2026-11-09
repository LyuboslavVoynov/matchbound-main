# Matchbound delivery sprints — 9 November 2026

Baseline: main `3b379ff`, after merged PRs #7 (eight leagues), #9 (release integration), #10 (Germany beer catalogue) and #11 (Rio Maior photo). Work happens in isolated branches. Around the Match remains an unrelated uncommitted draft in the original checkout. No automatic merges or manual production deployments are authorized by this plan.

## Current state

The merged product includes the UK switch, 24-second Weekend Journal reveal, Matchday Scorecards, country/competition/club identity, sharing and immutable beer tickets. The beer catalogue contains 20 reviewed German products from five breweries; product artwork and additional country batches remain incomplete. Existing legacy country-brand records remain the fallback.

The shared visual library has 39 published photos / 42 exact placements. The inventory has 133 unique cities and 154 grounds across eight leagues. Portugal covers all 16 cities and 16/18 grounds. Rio Ave and Alverca grounds remain unsourced. Milan and Bilbao have sample city/ground coverage; Allianz Arena has a local reviewed result-page background. Other destinations retain honest editorial fallbacks.

| Sprint | Branch | Deliverable | Finish gate |
| --- | --- | --- | --- |
| 4 — live release validation | `release/production-validation` | Repeatable, explicitly targeted live smoke suite; verified deployment report; fixes for reproduced release issues | Desktop/mobile real draw, reveal, saved result, identity, images, beer and sharing pass against the public deployment |
| 5 — visual library batches | `feat/visual-coverage-portugal`, then `feat/visual-coverage-netherlands` | Close sourced Portugal gaps, then expand the Netherlands as the next league batch | Subject/licence/crop review, byte-verified publication, exact runtime mappings and updated coverage report |
| 6 — beer country batches | `feat/beer-catalogue-portugal`, then `feat/beer-catalogue-netherlands` | 20–30 distinct reviewed products per destination country, using the existing catalogue/importer | Approved nonduplicate products, correct brewery/origin, reviewed source facts, dry run and live country selection |
| 7 — beer artwork | `feat/beer-artwork-library` | Product-specific artwork with provenance and reuse approval, credited within the existing ticket | Exact product mapping, safe approved publication and mobile/failure fallback verification |

## Sprint 4 — in progress

The public origin was verified as `https://random-footy-weekend.vercel.app` (Matchbound title and landing content). Branch-specific Vercel previews may require authentication and are not substitutes for checking the public origin. Vercel build status alone does not prove the application flow works.

Implementation:
- `playwright.production.config.ts` requires an explicit `PRODUCTION_BASE_URL`; it never starts or deploys a server.
- The live smoke tests opt out of the default local suite. They require the configured database to match the deployment, use real fixture records, create bounded temporary test draws and delete them in `finally` blocks.
- Exercise the live landing calendar and keyboard UK switch, a real non-UK draw, all seven reveal stages and the saved-result handoff. Check a broad timing bound rather than brittle exact millisecond assertions.
- Check recorded home/away score order when meetings are available, canonical WhatsApp URLs, no horizontal overflow and representative screenshots.
- Use controlled real Germany and Rio Maior fixture snapshots to check reduced motion, real identity images, reviewed stadium imagery, immutable catalogue beer facts and reload persistence.
- Preserve absence states: missing H2H, beer or imagery must not become invented data or block the trip.

Run with:

```sh
PRODUCTION_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.production.config.ts
```

Use the existing local suites for narrow fix verification. Reuse prior production-build evidence unless a reproduced issue requires a build-sensitive change. No broad critic cascade is needed for validation tooling or small technical repairs.

## Sprint 5 — content, not a visual redesign

Research the two remaining Portugal grounds first. If a correctly identified reusable source is unavailable, leave the gap visible and continue to the Netherlands; do not substitute another venue. Netherlands baseline is 16 cities / 18 grounds with no approved images in the shared manifest.

Collect and review a useful league batch before opening a PR, rather than opening one PR per photograph. Retain exact venue names and aliases, creator, source/original URL, licence/link, transformation note, focal point, byte size, hash and review date. Inspect representative web/mobile crops. Publish only reviewed selections through the existing immutable-key importer; verify public bytes and runtime selection. Report approved local coverage separately from verified Storage publication.

## Sprint 6 — catalogue depth

Portugal and the Netherlands come first because they are supported leagues without product-level beer pools. Follow with Spain, Italy and France as separate country branches; review UK nations independently so Welsh or Scottish origins are not labelled English. Germany already has its initial 20-product pilot.

Count distinct beer products, not breweries or umbrella brands. Prefer brewery product pages. Unknown style, ABV or description stays absent until sourced. Do not represent `<0.5%` as `0.0%`; alcohol-free ranges require an explicit model before import. Keep the saved product immutable, prices independent, equal product selection and the legacy fallback. No beer becomes eligible merely because a search/API returns it.

## Sprint 7 — artwork

Source permitted product-specific artwork; a brewery website displaying a logo does not establish reusable image permission. Record rights/credit information and keep the current Matchbound seal when a product has no approved artwork. Never use an unrelated beer's logo or generate a supposed official mark. Add approved artwork to the existing ticket with exact identity matching and failure fallbacks; no wheel or new reveal interaction is planned.

## Separate backlog

Around the Match needs its own scope and review after these sprints. Accounts, bookings, a general admin dashboard and a new visual redesign are outside this plan. Future content PRs should state their actual coverage and remaining gaps, and be merged by the user after review.
