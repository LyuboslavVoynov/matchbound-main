import type { FootballDataTeam } from "./football-data";
import { trustedVenueForTeam } from "./venue-registry";
import { REVIEWED_TEAM_NAMES } from "./reviewed-team-contract";

export function unresolvedVenueTeams(teams: readonly FootballDataTeam[]): FootballDataTeam[] {
  return teams.filter((team) => !trustedVenueForTeam(team.id) || REVIEWED_TEAM_NAMES[team.id] !== team.name);
}

export function hasFullVenueCoverage(teams: readonly FootballDataTeam[]): boolean {
  return teams.length > 0 && unresolvedVenueTeams(teams).length === 0;
}
