import type { FootballDataMatch, FootballDataTeam } from "./football-data";
import { selectCompetitions } from "./football-data-registry";
import { REVIEWED_COMPETITION_TEAM_IDS, REVIEWED_ROSTER_SEASON } from "./reviewed-team-contract";
import { unresolvedVenueTeams } from "./venue-coverage";

export function fixtureSyncOptions(args: readonly string[]) {
  const season = Number(args[0] ?? 2026);
  if (season !== REVIEWED_ROSTER_SEASON) throw new Error(`Only reviewed season ${REVIEWED_ROSTER_SEASON} can be imported.`);
  return { season, profiles: selectCompetitions(args[1]) };
}

/** Shared by preflight and apply; an empty or changed roster fails closed. */
export function verifySyncRoster(code: string, teams: readonly FootballDataTeam[], matches?: readonly FootballDataMatch[]) {
  const unresolved = unresolvedVenueTeams(teams);
  if (!teams.length || unresolved.length) throw new Error(`${code} has empty, unreviewed or changed teams: ${unresolved.map(team => team.id).join(", ")}`);
  const ids = new Set(teams.map(team => team.id));
  const expected = REVIEWED_COMPETITION_TEAM_IDS[code];
  if (!expected || ids.size !== expected.length || expected.some(id => !ids.has(id))) throw new Error(`${code} does not match its complete reviewed ${REVIEWED_ROSTER_SEASON} roster.`);
  if (ids.size !== teams.length) throw new Error(`${code} has duplicate roster IDs.`);
  if (matches?.some(match => match.competition.code !== code || !ids.has(match.homeTeam.id) || !ids.has(match.awayTeam.id))) throw new Error(`${code} has fixture teams or a competition outside its reviewed roster.`);
}

/** Serial import jobs stay below the provider's ten-requests-per-minute allowance. */
export function pacedFootballFetch(fetcher: typeof fetch = fetch): typeof fetch {
  let lastStarted: number | undefined;
  return async (input, init) => {
    const wait = lastStarted === undefined ? 0 : Math.max(0, 7000 - (Date.now() - lastStarted));
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    lastStarted = Date.now();
    return fetcher(input, init);
  };
}
