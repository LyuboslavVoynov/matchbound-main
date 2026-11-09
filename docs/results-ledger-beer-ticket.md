# Matchday scorecards and beer-ticket reveal

Branch: feat/results-ledger-beer-ticket, based on the Weekend Journal checkpoint f27bf36. Preview: http://localhost:3014/design/results-ticket. This work is independent of the UK-toggle PR and curated-photo-library branch.

## Matchup

The saved-result page now places a full-width fixture above a responsive Matchday Scorecards grid and beer ticket. Desktop uses two lower columns; mobile stacks the ledger above the ticket. Goal difference has been removed from presentation. Recorded meetings appear in a two-column scorecard grid on web and mobile, with dates and scores in their actual home/away order, newest first, and matching crests. The result and beer panels use the product’s existing Inter/sans-serif typography. Summary totals are recomputed from that same sample. Missing or invalid samples get an honest empty state.

The preview fixture and four historical results were copied from an existing football-data-backed saved trip. The preview contains no saved trip token and labels its trip dates as illustrative. It uses the same MatchResult component as real saved draws. Optional preview query `?beer=Berliner%20Pilsner` chooses another already-reviewed German brand for visual testing; `?empty=1` checks unavailable data. Neither modifies production draws.

## Stadium and sharing

The fixture header uses a verified photograph of the actual ground as its background, with a contrast overlay and linked creator/licence credit. Allianz Arena has a new reviewed local photo; existing exact Porto/Milan/Bilbao stadium mappings are reused. Unknown grounds retain the plain fallback rather than borrowing another stadium. The share actions now match the selected design: an outlined Copy link button with link icon and a labelled Share on WhatsApp button. Canonical URLs and clipboard announcements are retained.

## Beer

The existing approved country_beer_brands database pool already selects a country brand randomly when creating a draw. The new ticket reveals that immutable saved selection after a 1.5-second paper-pull animation. Reduced motion reveals immediately. Opening the ticket never redraws the match or selects a different beer. Optional localStorage remembers opened state on this device only; storage errors do not prevent revealing. The saved beer is identical for every viewer of a trip even if each viewer opens the ticket separately.

Current reviewed beer pool: eight entries across England, Germany, Spain and France. This change reuses that catalogue; it does not fabricate brands for countries without reviewed coverage. A ticket is rendered only when a saved country brand exists. City-average beer prices remain separate and explicitly are not stadium prices.

Three exact-match local logos are recorded in src/data/beer-artwork.json: Berliner Pilsner, Kronenbourg and 1664. Each retains author, source page and licence URL. The logo is used only for the exact country/brand pair; other brands and failed images use a generic Matchbound seal plus the correct beer name. The supplied Berliner Kindl Weisse example deliberately has no unverified parent-brand artwork. Trademark ownership remains with the respective owners; available attribution/reuse information is linked in the ticket.

## Validation

- Twelve focused tests passed: matchup calculation, beer snapshots/registry and artwork mapping/provenance.
- Six desktop/mobile browser cases passed: score order, reveal/reload, reduced motion, denied storage, missing history/beer.
- Five additional saved-draw and sharing regressions passed, including long names, single meetings, expired links, all four beer-data variants, clipboard and WhatsApp URL construction.
- TypeScript, focused lint and isolated production build passed.
- One scoped Product Critic review passed with no blocker or important finding.

No schema migrations, fixture changes, catalogue reseeding, deployment or PR creation were performed.
