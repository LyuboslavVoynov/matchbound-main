# Five next sprints — 15 November 2026

Baseline: main `0e943ec`; PRs through #21 merged. Six continental country catalogues have 20 reviewed products each. The existing Around the Match draft stays separate. Each sprint starts from the latest merged main in its own worktree; branches below are planned, not all already created. PRs require user merge; no auto-merge.

| Order | Branch | Deliverable | Acceptance |
| --- | --- | --- | --- |
| 1 | `codex/beer-catalogue-england` | 20 sourced English beers using the existing catalogue/importer | Domestic brewery origin, current product facts, UK nations kept separate, ambiguous ABVs omitted, additive import, desktop and iPhone ticket persistence verified |
| 2 | `codex/visual-coverage-germany` | German city and stadium photo coverage | Audit current fixture venues first; publish only individually reviewed subjects, rights and credit records; exact venue mappings, mobile crops and byte checks; quantify remaining gaps |
| 3 | `codex/visual-coverage-spain` | Spanish city and stadium photo coverage | Same source and publication checks; prioritize selectable venues currently using fallbacks; preserve graceful image failures |
| 4 | `codex/beer-artwork-expansion` | More exact-product licensed beer visuals | Audit 140-product pool after England; target at least 10 additional products across at least three countries, subject to verified rights; no brewery logo substituted for product artwork; credits and mobile fallback verified; report actual count if rights limit coverage |
| 5 | `codex/content-freshness-release` | Repeatable content readiness report and release verification | Read-only report of active/expired/due-soon beer reviews and city/stadium/artwork coverage per supported country; verify fixture freshness, production source links, image fallbacks and saved-ticket reload on desktop/iPhone; document any gaps without silently renewing reviews |

Implement sequentially. Content batches use focused schema/import/source checks and representative browser verification; no critics or production rebuilds for content-only additions. If runtime interaction changes become necessary, scope and review those separately under AGENTS.md. Existing sharing, 24-second reveal, typography and ticket layout stay outside this content plan.
