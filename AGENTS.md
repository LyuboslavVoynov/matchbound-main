# Matchbound agent workflow

## Proportionate review

Use the lightest review that addresses the actual risk of the change. Critics are available tools, not mandatory steps for every feature. The primary agent remains responsible for correctness, usability and completion.

| Change | Default review |
| --- | --- |
| Small styling, copy, icon, spacing or timing adjustment | Primary-agent review and one focused check; no critic |
| New page or substantial interaction | One independent critic, chosen for the main risk, once |
| Major flow or architecture change involving both functional and visual risks | Product Critic and Designer Critic, once each |
| Internal technical change without a UI impact | Relevant technical checks; no Designer Critic |
| Documentation or workflow change | Primary-agent review; no critic |

Choose `product_critic` for functional UX, validation, navigation, persistence, sharing and product scope. Choose `designer_critic` for hierarchy, typography, responsive layout, interaction and motion. Do not add both merely because a change is user-facing. Explicit user requests override these defaults.

When a critic is needed:

1. Finish the scoped implementation and relevant verification.
2. Provide the reviewer with the requirements, changed files, existing test evidence and local URL or screenshots when useful.
3. Request a read-only review scoped to the change. Pause implementation of the reviewed code during that review.
4. Fix blockers and important findings that are consistent with the agreed scope. Do not expand the feature to address unrelated polish.
5. Verify affected fixes. The primary agent may confirm straightforward fixes; request a focused follow-up only if a material issue remains uncertain.

There is no automatic final signoff or second review pass. Do not repeat a clean review. Follow-up reviews must inspect the specific unresolved issue rather than restart the full review. Report material deferred issues to the user.

Keep critic reports concise: severity, concrete issue, impact and recommended fix. Use `BLOCKER`, `IMPORTANT`, `POLISH` and `PASS` when helpful; do not require empty sections or before/after tables.

Designer Critic may use relevant Emil Kowalski skills (`emil-design-eng`, `mobile-native`, `break-ui`, `review-animations`, `find-animation-opportunities`) when installed and useful. Missing optional skills do not require installation, permission or a blocked review.

## Verification and compute budget

- Select checks from the behavior changed, not from a fixed checklist. Small reversible changes do not need new tests that merely mirror the implementation.
- Run the smallest meaningful test set first. Broaden only for an observed failure, cross-cutting risk or unresolved concern.
- Once checks pass, reuse their evidence. Repeat checks only when subsequent changes or failures justify it; rerun affected cases rather than an entire suite by default.
- Do not rebuild production for every cosmetic adjustment. Use a production build when changing build-sensitive configuration, server/client boundaries, routing or dependencies, or when preparing a release or investigating a production-only problem.
- Inspect the relevant UI state for visual changes. A small cosmetic follow-up can use a focused screenshot or browser check; it does not automatically restart reviews and production verification.
- Prefer one representative viewport for a small local adjustment. Check mobile and desktop when responsive behavior or a shared layout is affected, and reduced motion when changing animation behavior.
- Avoid brittle millisecond assertions; verify visible sequencing, usable states and reasonable timing bounds.
- Use subagents only when independent work or specialist review materially saves time or reduces risk. Do not delegate routine small edits. Do not create a review cascade where reviewers automatically spawn more reviewers.
- Keep progress updates concise and meaningful. Do not poll subagents repeatedly at short intervals or narrate unchanged status. Ask for checkpoints at useful milestones.

## Product constraints

Matchbound is a deliberately minimal football discovery product. Preserve the flow: Trip dates → draw locked → Country → City → Stadium → Match → persisted result. It should feel premium, cinematic, international, football-native, extremely simple, and mobile-first. Avoid generic SaaS, score-site, travel-booking, dashboard, EA FC clone, or AI-template aesthetics.

Do not introduce club crests, sound, accounts, regenerate actions, recommendations, flights, airports, hotels, maps, photography, match statistics, league tables, or an admin dashboard without explicit user direction.
