# Sprint 6 — reviewed Portugal beer catalogue

Branch: feat/beer-catalogue-portugal. Completed the initial 20-product batch from four domestic breweries: Musa (6), Dois Corvos (7), Super Bock (4) and Letra (3). Each record has a direct official product URL, sourced ABV, Portuguese brewery provenance and a review expiry. The manifest is separate from Germany and the existing importer remains additive.

The initial three uncertain one-off/collaboration candidates were removed before approval. The final Dois Corvos selection is its permanent range. Letra products A/B/C were checked in the current brewery shop; their style fields remain null rather than copy potentially stale descriptions. Super Bock's animated placeholder counters are not alcohol facts; values come from its specification tables. No cider, alcohol-free beer, foreign imports, copied marketing descriptions or borrowed product marks are included.

Provenance/review decisions are in data/beer-reviews/portugal.json. The original brewery pages establish facts, not image reuse permission. Artwork stays on the existing Matchbound seal pending the independent artwork sprint.

Validation: schema/duplicate/origin checks, six focused tests, TypeScript and importer dry run passed. Imported with `npm run beers:import -- data/beer-catalogue.portugal.json --apply`. Verified 20 approved active Portuguese products alongside the existing 20 German products in Supabase. Two live browser cases confirmed a country-scoped Portuguese beer and ABV persist after reload on desktop/mobile, including a city without price coverage. Saved draws keep their original beer selection.
