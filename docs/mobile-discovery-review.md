# Mobile discovery review — 11 November 2026

Branch: `fix/mobile-discovery-flow`, based on merged main `3d4b4e3`. Scope: calendar reachability, decorative arrow treatment and iPhone reveal sizing. Beer sourcing and the separate Around the Match draft are excluded.

One focused independent design critic reviewed the mobile hierarchy and reveal sizing. It identified the illustration/invitation preceding the form and fixed artwork heights as the main causes. The primary agent measured the baseline and visually inspected the updated layouts. No critic cascade or second signoff was requested.

## Changes

- Put the date form directly after the landing story in DOM order. Existing explicit desktop grid positions preserve desktop placement. The illustration and supporting invitation remain below the mobile form.
- Tighten mobile hero/form spacing and visually hide only the duplicate idle calendar prompt while the picker is closed and empty. Its live status and accessible description remain present; opening, selection, date-count feedback and validation retain their existing behaviour. In the 390×664 test view the date fields move from about 903px to about 400px down the page, and the Draw button fits in the initial view. Date choices also fit the first 320×568 view.
- Remove the journal wordmark's stock diagonal arrow and oversized country/city fallback arrow glyphs. Use a small drawn external-link SVG beside the brewery source. Preserve button arrows, including Draw my match.
- Apply a mobile card budget using stable viewport height and the bottom safe area. Shrink artwork and vertical spacing before text. Avoid repeating the league/stadium name inside mobile artwork when the heading already supplies it. Expanded photo credits lift the card cap and remain naturally scrollable; no content is hidden behind a fixed page overflow lock.
- Give the clubs panel its natural content height so the stadium line and closing caption cannot overlap on a short iPhone.

The approved colours, journal typography, per-stage card animations, 24-second autoplay, progress circles, photo credit pause/resume and reduced-motion handoff remain intact. No reveal controls were reintroduced.

## Verification

TypeScript, scoped lint and whitespace checks pass. The focused browser suite passed 24 cases across Safari/WebKit at 390×664 and 320×568, plus desktop Chromium at 1280×900. It covers calendar keyboard/editing/cross-month validation, draw submission, all five photo/editorial card bounds, the 24-second sequence, credit pause/resume and reduced motion. Screenshot review caught a clubs-caption overlap that container bounds alone missed; it was fixed, child-content bounds were added, and all nine affected layout cases passed again. Updated WebKit screenshots were inspected.

```sh
npx playwright test --config playwright.mobile-discovery.config.ts
```

The local development preview uses port 3020. These are browser-engine/device-viewport checks, not a claim of physical-device testing. No dependency, API, schema or content import changes are included.
