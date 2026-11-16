# Germany north visual batch — 16 November 2026

Branch `codex/germany-visuals-north`, based on main `191b47f` after the first German visual batch and safe duplicate-upload fix merged. Adds six exact city/ground placements: Hamburg City Hall and Volksparkstadion, Bremen City Hall and Weserstadion, Brandenburg Gate and the entrance of Stadion An der Alten Försterei in Berlin.

Each Commons source records author, reusable licence, source date and subject description. Optimized derivatives retain source licences, attribution, original links, transformation notes and byte hashes. `data/creatives/bl1-north/candidates.json` is discovery history; `reviewed.json` is the approved publication batch. The shared manifest contains the approved records. Berlin's ground photo is explicitly labelled an entrance view; it is not substituted with the Olympiastadion. Its focal point favors the identifying ground sign. City focal points preserve landmark rooflines.

Hamburg's source describes the ground under its former Imtech Arena name; it is the Volksparkstadion under historical naming, not a second venue. The September 2010 source date stays in the review record. Other source dates: Hamburg city August 2016, Bremen city September 2014, Bremen ground September 2024, Berlin city May 2019 and Berlin ground October 2019. These images do not claim present-day stadium conditions. No photos from club websites or unclear reuse licences are copied.

Approved Germany coverage becomes six of 18 cities and six of 18 grounds in the checked-in inventory. The regenerated research queue retains 24 unresolved subjects. This is not full-country completion or a claim about selectable fixtures outside that inventory. Previous reviewed photos, editorial fallbacks and the separate Around the Match draft remain intact.

Validation: 19 focused creative-library, storage, repository and sourcing tests; TypeScript; scoped ESLint; dry-run verification of six WebPs, six placements and 1,973,214 bytes. Publication uses the existing immutable-key importer and public hash verification. The explicit-origin browser config checks all three destinations on desktop Chromium and iPhone Safari/WebKit, including city reveals, exact ground backgrounds, decoding, credits, overflow and persisted beer-ticket reload. It creates and deletes only temporary test-owned draws.

```sh
npm run creatives:sync -- --manifest=data/creatives/bl1-north/reviewed.json --apply
CONTENT_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.germany-north.config.ts
```

All six live browser cases passed after successful publication and public-byte verification of every image. The Hamburg city reveal was visually inspected on iPhone, including its roofline-preserving crop. No runtime, dependency or schema changes. No automatic merge.
