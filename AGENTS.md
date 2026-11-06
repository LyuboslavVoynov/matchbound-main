# Matchbound agent workflow

## Product Critic review gate

For every meaningful user-facing change, the primary implementation agent must request an independent review from the custom `product_critic` subagent when subagent functionality is available.

Meaningful user-facing changes include user flows, pages, components, visual design, copy, interaction states, validation, sharing, localisation, and reveal behavior. Purely internal migrations, refactors, or test cleanup may skip this gate unless they affect visible behavior.

Required sequence:

1. Implement the scoped change.
2. Run relevant automated verification.
3. Delegate a read-only independent review to `product_critic`, including the requirements, changed files, test evidence, and local URL when available.
4. Evaluate its findings and fix every `BLOCKER` automatically.
5. Fix `IMPORTANT` findings when consistent with the agreed MVP; explain any deliberately deferred finding to the user.
6. Rerun relevant verification.
7. Request one final `product_critic` review.
8. Consider the feature complete only after that review has no `BLOCKER` or `IMPORTANT` findings.

Do not run more than two Product Critic passes per feature unless a serious defect remains. Product Critic is review-only and must not edit files or be run concurrently with implementation work. Its report must use `BLOCKER`, `IMPORTANT`, `POLISH`, and `PASS`, with concrete recommendations for every issue.

## Designer Critic review gate

For every meaningful UI, UX, typography, responsive-layout, interaction, or motion change, the primary agent must also delegate an independent read-only review to a `designer_critic` subagent when subagent functionality is available. Product Critic protects product simplicity and functional UX; Designer Critic protects visual craft, interaction feel, and mobile-native quality. They must not edit files or run concurrently with the primary implementation agent.

Designer Critic must use the installed Emil Kowalski design-engineering skills relevant to the change:

- `emil-design-eng` for visual hierarchy, component craft, interaction and motion decisions.
- `mobile-native` for mobile surfaces and touch interactions.
- `break-ui` for worst-case content and responsive stress tests.
- `review-animations` for any motion implementation.
- `find-animation-opportunities` only when deciding whether a new animation is justified.

Designer Critic should exercise the live UI where tooling permits and must be adversarial rather than agreeable. For UI reviews, its report must include the required `BLOCKER`, `IMPORTANT`, `POLISH`, and `PASS` sections plus an actual Markdown table with `Before`, `After`, and `Why` columns for every proposed visual or interaction change. It must not propose product features as a substitute for improving the existing experience.

For a meaningful UI or motion feature, the required completion sequence is:

1. Implement and run automated verification.
2. Product Critic reviews product/functional UX.
3. Designer Critic reviews visual, interaction, responsive and motion quality.
4. Fix all `BLOCKER` issues and MVP-consistent `IMPORTANT` issues from both reviews.
5. Re-run relevant verification.
6. Request one final combined pass from both critics, sequentially.
7. Stop after two review passes per critic unless a serious defect remains.

## Product constraints

Matchbound is a deliberately minimal football discovery product. Preserve the flow: Trip dates → draw locked → Country → City → Stadium → Match → persisted result. It should feel premium, cinematic, international, football-native, extremely simple, and mobile-first. Avoid generic SaaS, score-site, travel-booking, dashboard, EA FC clone, or AI-template aesthetics.

Do not introduce club crests, sound, accounts, regenerate actions, recommendations, flights, airports, hotels, maps, photography, match statistics, league tables, or an admin dashboard without explicit user direction.
