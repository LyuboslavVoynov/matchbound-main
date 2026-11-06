# Provider visual identity

Country flags, competition emblems and club crests use the URLs supplied by
football-data.org and stored with each draw. They are enabled by default in both
`next dev` and a production `next build` / `next start` deployment. No preview
flag is needed; the former `NEXT_PUBLIC_MATCHBOUND_INTERNAL_ASSET_PREVIEW`
variable has no effect.

Only credential-free HTTPS URLs on `https://crests.football-data.org` are
accepted. The same policy runs in the browser in development and production.
Adding another artwork host requires an explicit allowlist change and tests.
The current fixture catalog uses this provider origin for all three kinds of
artwork.

Flags and emblems disappear when unavailable. Club crests appear as a pair;
if either is missing or fails, neither crest is shown. Country, competition and
club text remain visible, and navigation never depends on an image loading.
Saved draws use their original artwork snapshot. Older draws without artwork
retain their text fallback. City and stadium photography is not used.

## Verification

- `npm test` checks URL policy and snapshots.
- `e2e/visual-identity.spec.ts` checks real provider image loading through the
  reveal and result, refresh stability, mobile overflow, and missing, failed or
  unapproved URLs. It creates and cleans up isolated test draws without modifying
  the fixture catalog.
- Run the same browser tests against both the development server and a server
  started with `npm run build` followed by `npm run start -- -p 3001` to verify
  the production client bundle. A deployment still needs `DATABASE_URL` and
  network access to the artwork CDN.
