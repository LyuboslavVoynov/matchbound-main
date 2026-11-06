import { describe, expect, it } from "vitest";
import { formatTripDates, matchupSummary, signedGoalDifference } from "@/domain/matchday";
import type { HeadToHeadSnapshot } from "@/domain/head-to-head";

const snapshot: HeadToHeadSnapshot = {
  asOf: "2026-11-06T00:00:00Z", homeTeamId: 1, awayTeamId: 2,
  homeWins: 99, draws: 99, awayWins: 99,
  meetings: [
    { id: 1, kickoffAt: "2026-01-01T00:00:00Z", competition: "League", homeTeam: "Home", awayTeam: "Away", homeTeamId: 1, awayTeamId: 2, homeScore: 3, awayScore: 0 },
    { id: 2, kickoffAt: "2026-02-01T00:00:00Z", competition: "League", homeTeam: "Away", awayTeam: "Home", homeTeamId: 2, awayTeamId: 1, homeScore: 2, awayScore: 1 },
    { id: 3, kickoffAt: "2026-03-01T00:00:00Z", competition: "League", homeTeam: "Home", awayTeam: "Away", homeTeamId: 1, awayTeamId: 2, homeScore: 1, awayScore: 1 },
  ],
};
describe("Matchday matchup presentation", () => {
  it("uses actual meetings for every number and orients reversed fixtures correctly", () => {
    expect(matchupSummary(snapshot)).toEqual({ count: 3, homeWins: 1, draws: 1, awayWins: 1, homeGoalDifference: 2, awayGoalDifference: -2 });
  });
  it("handles one draw and zero difference without claiming five meetings", () => {
    expect(matchupSummary({ ...snapshot, meetings: [snapshot.meetings[2]] })).toEqual({ count: 1, homeWins: 0, draws: 1, awayWins: 0, homeGoalDifference: 0, awayGoalDifference: -0 });
    expect([signedGoalDifference(4), signedGoalDifference(-4), signedGoalDifference(0), signedGoalDifference(-0)]).toEqual(["+4", "−4", "0", "0"]);
  });
  it("omits missing or invalid samples instead of displaying invented statistics", () => {
    expect(matchupSummary(undefined)).toBeUndefined();
    expect(matchupSummary({ ...snapshot, meetings: [] })).toBeUndefined();
    expect(matchupSummary({ ...snapshot, meetings: [{ ...snapshot.meetings[0], homeTeamId: 999 }] })).toBeUndefined();
    expect(matchupSummary({ ...snapshot, meetings: [{ ...snapshot.meetings[0], homeScore: -1 }] })).toBeUndefined();
  });
  it("formats the saved trip window independently of fixture dates", () => {
    expect(formatTripDates("2026-11-27", "2026-11-29")).toContain("27–29 November 2026");
    expect(formatTripDates("2026-11-29", "2026-11-29")).toBe("29 November 2026");
    expect(formatTripDates("2026-12-31", "2027-01-02")).toContain("2027");
  });
});
