# Head-to-head data

New provider-backed draws may contain an optional `headToHead` snapshot. Existing draws remain unchanged. Sprint 2 adds data only; the result page does not display it yet.

The server requests `/v4/matches/{id}/head2head?limit=5` using `FOOTBALL_DATA_API_KEY`. It keeps up to five valid, unique, completed meetings strictly before the snapshot time, ordered newest first. Filtering or incomplete provider coverage can produce fewer than five meetings. No eligible meetings means no snapshot.

Meeting scores retain their historical home/away order. Summary wins are oriented to the drawn fixture's home and away team IDs, with draws separate. Totals are computed from the stored meetings, never copied from provider aggregates. They represent the returned recent meetings, not an all-time record. Score comparisons use the provider's full-time score, not penalty-shootout winners.

Responses are cached in memory per application process for six hours, with a maximum of 200 entries and concurrent-request deduplication. This cache is not shared between server instances and is cleared on restart. Failures are cached for one minute. Requests time out after two seconds and have no retry delay in the draw path. An unavailable provider omits the optional snapshot; it does not change fixture selection.

The resulting snapshot is stored in the existing draw JSON, so refresh and shared links do not fetch or recalculate H2H data. CSV fixtures, missing team IDs and absent credentials skip the provider entirely. No database migration is needed.
