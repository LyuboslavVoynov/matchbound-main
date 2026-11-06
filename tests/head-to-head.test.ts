import { afterEach, describe, expect, it, vi } from "vitest";
import { snapshotHeadToHead } from "@/domain/head-to-head";
import { createHeadToHeadLookup } from "@/providers/head-to-head";

const asOf = new Date("2026-11-06T12:00:00Z");
const meeting = (id: number, date: string, home = 1, away = 2, homeScore: number | null = 2, awayScore: number | null = 0, status = "FINISHED") => ({ id, utcDate: date, status, homeTeam: { id: home, name: `Team ${home}` }, awayTeam: { id: away, name: `Team ${away}` }, competition: { name: "League" }, score: { fullTime: { home: homeScore, away: awayScore } } });
const fixture = { sourceId: "football-data:123", homeTeamProviderId: "1", awayTeamProviderId: "2" };
afterEach(() => vi.unstubAllEnvs());

describe("head-to-head snapshot", () => {
  it("orders the last five meetings and counts results against drawn team IDs, ignoring upstream totals", () => {
    const snapshot = snapshotHeadToHead({ aggregates: { homeTeam: { wins: 999 } }, matches: [
      meeting(1, "2026-01-01T12:00:00Z"), meeting(2, "2026-02-01T12:00:00Z", 2, 1),
      meeting(3, "2026-03-01T12:00:00Z", 1, 2, 1, 1), meeting(4, "2026-04-01T12:00:00Z"),
      meeting(5, "2026-05-01T12:00:00Z", 2, 1, 0, 1), meeting(6, "2026-06-01T12:00:00Z"),
    ] }, 1, 2, asOf)!;
    expect(snapshot.meetings.map(m => m.id)).toEqual([6, 5, 4, 3, 2]);
    expect(snapshot).toMatchObject({ homeWins: 3, awayWins: 1, draws: 1, asOf: asOf.toISOString() });
    expect(snapshot.meetings[1]).toMatchObject({ homeTeamId: 2, homeScore: 0, awayTeamId: 1, awayScore: 1 });
  });
  it("omits future, incomplete, unrelated, invalid and duplicate meetings", () => {
    const valid = meeting(1, "2026-01-01T12:00:00Z");
    const snapshot = snapshotHeadToHead({ matches: [valid, valid, {}, meeting(2, asOf.toISOString()), meeting(3, "2027-01-01T12:00:00Z"), meeting(4, "2026-01-01T12:00:00Z", 1, 2, null), meeting(5, "2026-01-01T12:00:00Z", 1, 2, 1, 0, "IN_PLAY"), meeting(6, "2026-01-01T12:00:00Z", 3, 2)] }, 1, 2, asOf);
    expect(snapshot?.meetings).toHaveLength(1);
    expect(snapshotHeadToHead({ matches: [] }, 1, 2, asOf)).toBeUndefined();
    expect(snapshotHeadToHead({}, 1, 2, asOf)).toBeUndefined();
  });
});

describe("optional head-to-head lookup", () => {
  it("deduplicates concurrent requests and expires cached responses", async () => {
    vi.stubEnv("FOOTBALL_DATA_API_KEY", "test-only");
    let now = 0;
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ matches: [meeting(1, "2026-01-01T12:00:00Z")] })));
    const lookup = createHeadToHeadLookup(fetcher, () => now);
    const [a, b] = await Promise.all([lookup(fixture, asOf), lookup(fixture, asOf)]);
    expect(a).toEqual(b);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining("/matches/123/head2head?limit=5"), expect.objectContaining({ signal: expect.any(AbortSignal) }));
    now = 6 * 60 * 60 * 1000 + 1;
    await lookup(fixture, asOf);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("skips CSV fixtures and missing keys without calling the provider", async () => {
    vi.stubEnv("FOOTBALL_DATA_API_KEY", "test-only");
    const fetcher = vi.fn(); const lookup = createHeadToHeadLookup(fetcher);
    expect(await lookup({ ...fixture, sourceId: "dev-123" }, asOf)).toBeUndefined();
    vi.stubEnv("FOOTBALL_DATA_API_KEY", "");
    expect(await lookup(fixture, asOf)).toBeUndefined();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("tolerates provider failures and retries after a short negative-cache period", async () => {
    vi.stubEnv("FOOTBALL_DATA_API_KEY", "test-only");
    let now = 0;
    const fetcher = vi.fn().mockRejectedValue(new Error("network unavailable"));
    const lookup = createHeadToHeadLookup(fetcher, () => now);
    expect(await lookup(fixture, asOf)).toBeUndefined();
    expect(await lookup(fixture, asOf)).toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(1);
    now = 61_000; await lookup(fixture, asOf);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
