# Next three content sprints

Baseline: main009e0cc, with production Supabase imagery and image-failure fallback verified on desktop and mobile after configuration correction. Existing Around the Match changes stay outside these branches. No automatic merge.

| Sprint | Branch | Scope | Acceptance |
| --- | --- | --- | --- |
| 5 | feat/visual-coverage-netherlands | 16 cities and18grounds; separately track unresolved Rio Ave/Alverca sources | Individually verified subject/source/creator/licence, exact mappings, responsive crop, immutable publication and byte verification; report actual gaps |
| 6 | feat/beer-catalogue-portugal | Target20–30distinct Portuguese products using existing importer | Brewery/product provenance and current range reviewed; nullable unsupported facts; country-scoped immutable selection; no imported foreign beers or cider |
| 7 | feat/beer-artwork-library | Product-specific approved artwork pipeline and matching | Exact product ID/country, recorded rights and credits, verified local bytes; unapproved assets retain the Matchbound seal |

Each sprint has its own worktree based on main, rather than stacking unfinished branches. Content/source discovery is not publication approval. Existing runtime fallbacks remain available. Source-review batches should be useful enough for one PR per batch, not one PR per photograph. Unknown or unavailable sources remain explicit gaps. Portugal beer import uses its separate manifest and preserves Germany products and saved draws. Artwork can begin with the existing Germany catalogue independently of Portugal.

Implement sequentially with narrow checks; no parallel critics are needed for internal content tooling. Open reviewed PRs without auto-merging. Do not call a sprint complete until its acceptance and coverage report demonstrate it.
