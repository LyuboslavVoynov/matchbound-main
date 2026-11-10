# Content release verification — 10 November 2026

Verified merged main `d629d05` after PRs #13, #14 and #15 on the public production origin `https://random-footy-weekend.vercel.app`. Vercel reported success for that merge commit.

All 12 production browser cases passed on desktop and mobile. They covered Amsterdam, Utrecht, Leeuwarden/new Kooi Stadion, Rio Maior and both exact-product beer photographs. Checks confirmed the actual public images decode, the Utrecht city reveal uses its exact image, credits retain their licences, Portuguese beer identity and ABV persist after reload, and a blocked beer photograph falls back to its seal without changing the saved beer. No horizontal overflow was detected. Temporary test draws were deleted in each test's cleanup.

Repeat with the deployment's matching database configured locally:

```sh
RELEASE_BASE_URL=https://random-footy-weekend.vercel.app npx playwright test --config playwright.content-release.config.ts
```

The explicit-target config runs the existing content and artwork cases together. It starts no server and performs no deployment. It creates only bounded test-owned draws, then deletes them. Never point it at a deployment backed by a different database.

Released coverage: 33 Dutch photos cover all 16 destination cities and 17/18 grounds; Koning Willem II Stadion retains its editorial fallback. The country catalogue has 20 German and 20 Portuguese reviewed beers. Product artwork starts with two credited CC BY-SA 3.0 photographs; remaining products retain their seal. Neither image presence nor source-site display implies permission to reuse an official product logo.

Next planned country batch: Netherlands beer products, independently reviewed and imported additively. Around the Match remains separate in the original worktree.
