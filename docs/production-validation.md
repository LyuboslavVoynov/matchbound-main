# Production validation — 9 November 2026

Branch: `release/production-validation`, from merged main `3b379ff` (PRs #7, #9, #10 and #11).

## Targets and boundaries

Public app: https://random-footy-weekend.vercel.app. Its title/landing identify Matchbound. The Vercel main-branch preview alias redirects to authentication, so checks use the public app. Successful Vercel deployment status is recorded separately from functional validation.

The explicit smoke command is:

```sh
PRODUCTION_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.production.config.ts
npx tsx scripts/release-preflight.ts
```

The smoke config never starts or deploys a server. It requires a credential-free HTTP(S) origin. The test file skips in the default local suite unless the target is explicitly set. The configured validation database must match the app: the real API-created draw is read back before checking it. Controlled cases use real fixture rows and one-hour temporary saved trips. Test-owned draws are deleted in `finally` blocks; no seed data, user draws, fixtures or creative records are changed.

## Live findings

Passed on desktop and mobile:
- Landing calendar, keyboard UK toggle and actual non-UK draw.
- All seven reveal stages and the automatic saved-result handoff, taking roughly 24 seconds rather than a test-clock simulation.
- Matching saved city, country and clubs; actual recorded score order when H2H data exists.
- Canonical WhatsApp trip URL and real clipboard copy/read-back.
- Germany's saved beer ticket, brewery source and reload persistence, plus the existing Allianz Arena photo.
- No horizontal overflow in inspected states.

Two issues prevent calling the release fully validated:

1. **Published Supabase imagery is absent from the public app.** The controlled Rio Maior result has no stadium image and makes no Supabase image request. The same exact database lookup resolves locally, and the object was previously public-byte verified. This points to missing/mismatched production `SUPABASE_URL` / bucket configuration or access in the deployment environment; Vercel settings/logs have not been inspected directly. The user has been asked to verify the public URL and bucket variables and redeploy if changed. Do not claim a confirmed environment-variable diagnosis until that is checked.
2. **Early image errors can precede React hydration.** Aborting image requests in a fresh browser context leaves the server-rendered Allianz image in the DOM on the current public release. This is reproducible without any decoded-image cache. The branch fixes `StadiumBackdrop` by checking an already-completed image's natural width after hydration, in addition to its ordinary error handler. Failure state is tied to the image source so another photo can load normally.

The smoke suite intentionally keeps these checks strict. A missing required reviewed photo is not turned into a passing test or hidden behind a skip.

Follow-up: redeployment did not restore Rio Maior imagery on either viewport. Missing public Storage configuration previously returned silently, and query failures use Warning-level logs, so an empty Error filter does not establish a healthy configuration. The branch now emits one warning per reason per server process for missing/invalid public configuration or a stored image origin/bucket mismatch. Logs contain only fixed reason labels, never variable values, image URLs or credentials. Five focused repository tests, TypeScript and scoped lint pass for this diagnostic change.

## Data preflight

Read-only audit at 14:27 UTC confirmed future reviewed/active confirmed fixture rows for all eight supported leagues: PL280, PD260, BL1225, SA270, FL1216, ELC372, DED198 and PPL207. These are database coverage counts, not a guarantee of every future provider kickoff or a proof that all dates have a match.

Approved catalogue coverage: Germany20products. Published library:39assets /42placements. The local server environment has the public Storage origin and expected bucket, and the exact Rio Maior remote mapping resolves. The preflight output explicitly describes its scope as the configured validation database/local server environment, not remote Vercel configuration.

## Verification and next action

The early-error fix compiled in a production build, including lint and TypeScript. The affected saved-trip smoke cases are checked against that build on desktop and mobile. The local preview on port3016 now serves this current build rather than the older integration checkout.

After the fix is merged and the public Storage configuration is confirmed, rerun the six live smoke cases. Keep the release gate open until both the known-photo and failed-image cases pass on the public app. Continue source-reviewed image and beer batches on their separate sprint branches; see `docs/sprint-roadmap.md`.
