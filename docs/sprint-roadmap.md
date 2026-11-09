# Matchbound delivery sprints — 9 November 2026

Main baseline: a81c3ce (UK switch merged). The original Around the Match checkout remains excluded. No sprint authorizes automatic merges or production deployments. Local source checkpoints remain available independently.

| Sprint | Branch | Outcome | Dependency |
| --- | --- | --- | --- |
| 1 | sprint/01-release-integration | One coherent release candidate combining eight leagues, UK filtering, 24-second journal reveal, published Supabase visuals, Matchday Scorecards and optional beer ticket | Main + existing PR7 + approved local feature branches |
| 2 | feat/beer-catalogue | Verified product-level beer catalogue with information/artwork and country selection | Sprint1 contracts |
| 3 | feat/visual-coverage | Reviewed city/stadium image coverage expanded league by league | Existing creative-library importer/schema |
| 4 | release/production-validation | Reviewed release deployed and checked on its public URL | Approved integration + content batches |

## Sprint 1 — release integration (implemented locally)

Acceptance:
- Preserve the merged Include UK matches switch. Its exclusion applies to venue location before random selection.
- Keep the active eight-league allowlist, complete roster gates, correct Welsh destinations and island timezones.
- Retain the approved 24-second, distinct whole-card reveal and filling chapter circles, without playback buttons.
- Read approved published images from Supabase for both reveal cards and the final stadium header. Keep exact mappings, creator/licence credits and missing-image fallbacks.
- Retain two-column Matchday Scorecards, product typography, beer-ticket reveal, Copy link and labelled WhatsApp actions on web/mobile.
- Reuse the small existing reviewed beer pool honestly; do not claim the larger catalogue is complete.
- Run the combined unit suite once, focused desktop/mobile integration cases, production build and one scoped integration review.

Implementation: integrated main, the existing GitHub league PR head, Weekend Journal f27bf36, curated library/publication35d0273, and result-page510883e. Resolved overlapping query filters by retaining both the UK exclusion and league eligibility rules. The final result page now obtains its stadium background from the same approved Supabase lookup used by the reveal, with the reviewed local fallback for Allianz Arena and existing samples.

The integration review found that optional image-query failures could block a valid saved trip; the shared creative lookup now returns the reviewed local/plain fallback for any failed optional artwork query, with a focused rejection test. The combined browser run also exposed a calendar RAF focus-restoration race; restoration now occurs synchronously after closing, preserving later keyboard focus on the UK switch.

Validation:87unit tests passed in the combined suite; a new rejected-artwork regression also passes (88unique cases). Twenty targeted desktop/mobile browser cases passed across the combined and affected reruns: reveal playback, real non-UK draws, live Funchal Supabase imagery through handoff, scorecards/beer persistence, fallbacks, UK-switch keyboard/request behaviour and calendar keyboard navigation. TypeScript and lint passed (two pre-existing configuration warnings). The final production build passed after the optional-image error-boundary fix. One integration-only Product review found that issue; the focused regression and primary verification closed it.

No content reseeding, migration replay, data deletion or deployment is required for this integration. The creative migration/upload were already verified:38photos,41placements. Live test-created draws are temporary and cleaned up.

## Sprint 2 — beer catalogue (Germany pilot implemented)

Acceptance:
- Distinct brewery and beer-product records; do not count brewery names and umbrella brands as separate beers.
- Verified origin, brewery, product name and style; ABV, description and alcohol-free status remain nullable unless sourced.
- Source URL, review date, approval status and exact artwork mapping with usage/credit records.
- Explicit country/home-nation rules so country labels never misrepresent provenance.
- Start with a reviewed Germany pilot, target20–30distinct approved beers per supported destination country, then publish further country batches.
- Preserve legacy saved draws. Import/dry-run tooling rejects duplicates, unsourced claims and unapproved artwork. No new beer is eligible merely because a search API returned it.
- Selection remains server-side and country-scoped; the selected product is saved once in the immutable trip snapshot. The ticket reveals that saved selection.

Implementation: `feat/beer-catalogue` adds normalized breweries/products, strict transactional imports, nation-specific selection, immutable snapshot facts and ticket source/ABV details. The configured database now has20approved Germany products from five breweries, with RLS enabled. Thirteen targeted unit tests and two desktop/mobile saved-ticket checks passed; TypeScript, scoped lint and production build passed. One scoped Product review found a schema/snapshot RLS mismatch, now fixed with an empty follow-up schema diff. Product logos and additional country batches remain incomplete.

Deliver data/model/import in one branch; use small country commits for review. Keep the eight legacy catalogue entries until explicitly reviewed/replaced. Expanded coverage is incomplete until the approved counts and artwork report demonstrate it.

## Sprint 3 — visual coverage

Acceptance:
- Publish reviewed batches for remaining destinations, starting with the three Portugal ground gaps, then one complete additional league at a time.
- Inventory baseline:133unique cities,154grounds across eight leagues. Current coverage includes16Portuguese cities and15/18Portuguese grounds, plus the Milan/Bilbao samples. Allianz Arena remains a local reviewed result-page background until imported into the shared collection.
- Record subject, creator, licence, original/source links and focal points. Never substitute a neighbouring ground or treat automated search hits as approval.
- Report covered/missing subjects after each import. Preserve immutable file keys, byte verification and approval/publication gates.

## Sprint 4 — production validation

Acceptance:
- Reconcile approved PRs onto currentmain; inspect merge conflicts rather than overwriting one feature with another.
- Verify server runtime DATABASE_URL, SUPABASE_URL and bucket configuration. The upload secret remains confined to the trusted import environment.
- Check real date search, UK exclusion, all enabled leagues, live Supabase images/credits, missing data, 24-second handoff, score order, beer country selection and canonical sharing URLs.
- Inspect desktop/mobile, reduced motion and slow/missing imagery. Confirm build/CI and public deployment state separately from merge state.
- Merge/deploy only within the user's authorization, then check the actual production URL and document remaining coverage.

## Separate backlog

Around the Match is an older uncommitted draft in the original checkout. It needs a fresh scope/review after these sprints; do not accidentally include it in release integration. Accounts, bookings and a general admin dashboard are not part of this plan.
