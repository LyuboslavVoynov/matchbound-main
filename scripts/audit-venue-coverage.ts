import "dotenv/config";
import { createFootballDataClient } from "../src/providers/football-data";
import { SUPPORTED_COMPETITIONS } from "../src/providers/football-data-registry";
import { trustedVenueForTeam } from "../src/providers/venue-registry";

async function main() {
  const client = createFootballDataClient();
  const rosters = await Promise.all(SUPPORTED_COMPETITIONS.map(async (competition) => ({ competition, teams: await client.getCompetitionTeams(competition.code) })));
  const unresolved = rosters.flatMap(({ competition, teams }) => teams.filter((team) => !trustedVenueForTeam(team.id)).map((team) => ({ competition: competition.code, providerTeamId: team.id, team: team.name, stadium: team.venue, providerAddress: team.address })));
  console.log(JSON.stringify({ reviewed: rosters.reduce((total, roster) => total + roster.teams.length, 0) - unresolved.length, unresolved }, null, 2));
}
main().catch(() => { console.error("Venue coverage audit failed."); process.exitCode = 1; });
