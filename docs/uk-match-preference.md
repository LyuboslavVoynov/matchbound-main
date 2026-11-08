# Include UK matches

Branch: feat/toggle-feature. Preview: http://localhost:3013/.

The approved compact switch sits between trip dates and the draw button. It defaults on. Switching off excludes venues in England, Wales, Scotland and Northern Ireland (including UK-wide country labels), using the canonical venue country rather than the competition country. The Republic of Ireland is not excluded. This preference does not enable any otherwise unsupported competitions.

POST /api/draw accepts an optional boolean includeUK, defaulting true for existing clients. Exclusion occurs before random selection. If no eligible non-UK fixtures remain, a 404 explains how to change dates or include UK games; it never relaxes the preference. Existing draw snapshots and links are unchanged. The choice is retained through form validation/errors, and disabled during submission; it is not persisted across page reloads.

Checks: 8 focused API/SQL tests, TypeScript and ESLint passed. Desktop/mobile browser tests cover keyboard operation, both request values and retained preference on no-match errors. Read-only fixture verification for 27–29 November 2026 returned 74 eligible matches with UK included and 52 with UK excluded; all excluded-scope venue countries were outside the UK. No fixture records were changed.
