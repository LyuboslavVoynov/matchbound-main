import { snapshotHeadToHead } from "@/domain/head-to-head";

const CACHE_TTL = 6 * 60 * 60 * 1000;
const FAILURE_TTL = 60 * 1000;
const MAX_ENTRIES = 200;

/** Bounded per-process cache, including short-lived failures and concurrent request deduplication. */
export function createHeadToHeadLookup(fetcher: typeof fetch = fetch, clock = Date.now) {
  const cache = new Map<string, { expires: number; value: Promise<unknown> }>();
  return async function lookup(fixture: { sourceId: string; homeTeamProviderId: string | null; awayTeamProviderId: string | null }, asOf: Date) {
    const matchId = /^football-data:([1-9]\d*)$/.exec(fixture.sourceId)?.[1];
    const home = Number(fixture.homeTeamProviderId), away = Number(fixture.awayTeamProviderId);
    const key = process.env.FOOTBALL_DATA_API_KEY;
    if (!matchId || !Number.isSafeInteger(home) || home <= 0 || !Number.isSafeInteger(away) || away <= 0 || !key) return undefined;
    // Keep credentials out of cache keys and logs. Cache is scoped to one configured provider account.
    const now = clock();
    for (const [id, entry] of cache) if (entry.expires <= now) cache.delete(id);
    let entry = cache.get(matchId);
    if (!entry) {
      while (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
      const value = (async () => {
        try {
          const response = await fetcher(`https://api.football-data.org/v4/matches/${matchId}/head2head?limit=5`, {
            headers: { "X-Auth-Token": key, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(2000),
          });
          if (!response.ok) throw new Error("Head-to-head unavailable");
          return await response.json();
        } catch {
          return undefined;
        }
      })();
      entry = { expires: now + CACHE_TTL, value };
      cache.set(matchId, entry);
    }
    const raw = await entry.value;
    if (raw === undefined) entry.expires = Math.min(entry.expires, clock() + FAILURE_TTL);
    return snapshotHeadToHead(raw, home, away, asOf);
  };
}

export const findHeadToHeadForFixture = createHeadToHeadLookup();
