import { describe, expect, it, vi } from "vitest";
import { SUPPORTED_COMPETITIONS, selectCompetitions } from "@/providers/football-data-registry";
import { expandedLeagueVenues } from "@/providers/expanded-league-venues";
import { REVIEWED_TEAM_NAMES } from "@/providers/reviewed-team-contract";
import { reviewedVenues, trustedVenueForTeam } from "@/providers/venue-registry";
import { validateVenueRegistry } from "@/providers/venue-registry-validation";
import { fixtureSyncOptions, pacedFootballFetch, verifySyncRoster } from "@/providers/fixture-sync";
import { localFixtureDate } from "@/providers/football-data-normalize";
import { createFootballDataClient } from "@/providers/football-data";
import { fixtureDestination } from "@/domain/fixture-destination";

const expected = {
  ELC: [59,60,68,69,70,72,74,76,325,328,332,340,342,343,346,348,356,384,387,404,563,715,1081,1126],
  DED: [666,670,672,673,674,675,676,677,678,680,682,684,718,1909,1912,1915,1920,6806],
  PPL: [496,498,503,582,583,712,1903,5527,5529,5530,5531,5533,5543,5575,5613,6618,7822,9136],
};

describe("reviewed European league expansion", () => {
  it("approves exactly eight leagues and scopes imports without Champions League", () => {
    expect(SUPPORTED_COMPETITIONS.map(profile => profile.code)).toEqual(["PL", "PD", "BL1", "SA", "FL1", "ELC", "DED", "PPL"]);
    expect(fixtureSyncOptions(["2026", "ELC,DED,PPL"]).profiles.map(profile => profile.code)).toEqual(["ELC", "DED", "PPL"]);
    expect(() => selectCompetitions("CL")).toThrow();
    expect(() => selectCompetitions("")).toThrow();
    expect(() => fixtureSyncOptions(["bad", "ELC"])).toThrow();
    expect(() => fixtureSyncOptions(["2027", "ELC"])).toThrow();
  });
  it("covers all sixty contracted 2026 roster IDs with reviewed venue data", () => {
    expect(expandedLeagueVenues).toHaveLength(60);
    expect(validateVenueRegistry()).toEqual([]);
    expect(new Set(reviewedVenues.map(venue => venue.providerTeamId)).size).toBe(reviewedVenues.length);
    for (const [code, ids] of Object.entries(expected)) {
      const venues = expandedLeagueVenues.filter(venue => venue.competitionCode === code);
      expect(venues.map(venue => venue.providerTeamId).sort((a, b) => a - b)).toEqual(ids);
      const roster = venues.map(venue => ({ id: venue.providerTeamId, name: REVIEWED_TEAM_NAMES[venue.providerTeamId], shortName: null, venue: null, address: null }));
      expect(() => verifySyncRoster(code, roster)).not.toThrow();
    }
  });
  it("corrects stale provider grounds and postal locations", () => {
    expect(trustedVenueForTeam(60)).toMatchObject({ stadium: "Toughsheet Community Stadium", city: "Horwich" });
    expect(trustedVenueForTeam(1126)?.stadium).toBe("ProAmpac Stadium");
    expect(trustedVenueForTeam(1909)?.stadium).toBe("Kooi Stadion");
    expect(trustedVenueForTeam(1912)).toMatchObject({ stadium: "BUKO Stadion", city: "Velsen-Zuid" });
    expect(trustedVenueForTeam(6618)).toMatchObject({ city: "Rio Maior", stadium: "Estádio Municipal de Rio Maior" });
    expect(trustedVenueForTeam(9136)).toMatchObject({ city: "Amadora", stadium: "Estádio José Gomes" });
    expect(trustedVenueForTeam(5530)).toMatchObject({ city: "Ponta Delgada", stadium: "Estádio de São Miguel" });
  });
  it("separates Welsh destination geography and flag from the English competition", () => {
    for (const id of [72, 404, 715]) expect(trustedVenueForTeam(id)?.country).toBe("Wales");
    const competition = { country: "England", areaFlagUrl: "https://crests.football-data.org/770.svg" };
    expect(fixtureDestination("Wales", competition)).toEqual({ country: "Wales", countryFlagUrl: null });
    expect(fixtureDestination("England", competition).countryFlagUrl).toBe(competition.areaFlagUrl);
  });
  it("uses stadium island offsets and daylight saving for the calendar date", () => {
    expect(trustedVenueForTeam(5529)?.timezone).toBe("Atlantic/Madeira");
    expect(trustedVenueForTeam(5575)?.timezone).toBe("Atlantic/Madeira");
    expect(trustedVenueForTeam(5530)?.timezone).toBe("Atlantic/Azores");
    expect(localFixtureDate("2026-11-07T00:30:00Z", "Atlantic/Azores")).toBe("2026-11-06");
    expect(localFixtureDate("2026-11-07T00:30:00Z", "Europe/Lisbon")).toBe("2026-11-07");
    expect(localFixtureDate("2026-07-09T23:30:00Z", "Atlantic/Azores")).toBe("2026-07-09");
    expect(localFixtureDate("2026-07-09T23:30:00Z", "Atlantic/Madeira")).toBe("2026-07-10");
    expect(localFixtureDate("2026-07-09T23:30:00Z", "Europe/Lisbon")).toBe("2026-07-10");
  });
  it("blocks empty, renamed or missing venues and foreign fixture teams before writes", () => {
    const swans = { id: 72, name: "Swansea City AFC", shortName: null, venue: null, address: null };
    expect(() => verifySyncRoster("ELC", [])).toThrow();
    expect(() => verifySyncRoster("ELC", [{ ...swans, id: 999999 }])).toThrow();
    expect(() => verifySyncRoster("ELC", [{ ...swans, name: "Unreviewed rename" }])).toThrow();
    expect(() => verifySyncRoster("ELC", [swans], [{ id: 1, utcDate: "2026-11-07T15:00:00Z", status: "TIMED", matchday: 1, competition: { id: 1, code: "ELC", name: "Championship", emblem: null }, homeTeam: { id: 72, name: swans.name, crest: null }, awayTeam: { id: 999999, name: "Unknown", crest: null } }])).toThrow();
  });
  it("rejects partial and mixed league rosters even when every individual team is reviewed", () => {
    const roster = expected.ELC.map(id => ({ id, name: REVIEWED_TEAM_NAMES[id], shortName: null, venue: null, address: null }));
    expect(() => verifySyncRoster("ELC", roster.slice(1))).toThrow(/complete reviewed/);
    expect(() => verifySyncRoster("ELC", [{ ...roster[0], id: 57, name: REVIEWED_TEAM_NAMES[57] }, ...roster.slice(1)])).toThrow(/complete reviewed/);
  });
  it("binds provider teams to the requested fixture season", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ teams: [] })));
    await createFootballDataClient("test", fetcher).getCompetitionTeams("ELC", 2026);
    expect(fetcher).toHaveBeenCalledWith("https://api.football-data.org/v4/competitions/ELC/teams?season=2026", expect.any(Object));
  });
  it("paces serial provider reads below the account rate limit", async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn().mockResolvedValue(new Response("{}"));
      const paced = pacedFootballFetch(fetcher);
      await paced("https://example.test/first");
      const second = paced("https://example.test/second");
      expect(fetcher).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(7000);
      await second;
      expect(fetcher).toHaveBeenCalledTimes(2);
    } finally { vi.useRealTimers(); }
  });
});
