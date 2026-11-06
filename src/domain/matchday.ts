import type { HeadToHeadSnapshot } from "./head-to-head";

/** Recompute every displayed number from the same, fixture-oriented meeting sample. */
export function matchupSummary(snapshot: HeadToHeadSnapshot | undefined) {
  if (!snapshot?.meetings.length) return undefined;
  let homeWins = 0, draws = 0, awayWins = 0, goalDifference = 0;
  for (const match of snapshot.meetings) {
    const sameOrder = match.homeTeamId === snapshot.homeTeamId && match.awayTeamId === snapshot.awayTeamId;
    const reverseOrder = match.homeTeamId === snapshot.awayTeamId && match.awayTeamId === snapshot.homeTeamId;
    if ((!sameOrder && !reverseOrder) || !Number.isInteger(match.homeScore) || !Number.isInteger(match.awayScore) || match.homeScore < 0 || match.awayScore < 0) return undefined;
    const difference = (match.homeScore - match.awayScore) * (sameOrder ? 1 : -1);
    goalDifference += difference;
    if (difference > 0) homeWins++; else if (difference < 0) awayWins++; else draws++;
  }
  return { count: snapshot.meetings.length, homeWins, draws, awayWins, homeGoalDifference: goalDifference, awayGoalDifference: -goalDifference };
}

export function signedGoalDifference(value: number) {
  return value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "0";
}

export function formatTripDates(start: string, end: string) {
  const format = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const from = new Date(`${start}T00:00:00Z`), to = new Date(`${end}T00:00:00Z`);
  return start === end ? format.format(from) : format.formatRange(from, to).replace(/\s*–\s*/g, "–");
}
