import "dotenv/config";
import { createFootballDataClient } from "../src/providers/football-data";
import { fixtureSyncOptions, verifySyncRoster, pacedFootballFetch } from "../src/providers/fixture-sync";
import { validateVenueRegistry } from "../src/providers/venue-registry-validation";

async function main() {
  const validationErrors = validateVenueRegistry();
  if (validationErrors.length) throw new Error(`Venue registry validation failed:\n${validationErrors.join("\n")}`);
  const { season, profiles } = fixtureSyncOptions(process.argv.slice(2));
  const client = createFootballDataClient(undefined, pacedFootballFetch());
  const report = [];
  for (const competition of profiles) {
    const teams = await client.getCompetitionTeams(competition.code, season);
    verifySyncRoster(competition.code, teams);
    const fixtures = await client.getCompetitionMatches(competition.code, season);
    verifySyncRoster(competition.code, teams, fixtures);
    report.push({ competition: competition.code, action: "ready_for_fixture_upsert", teams: teams.length, fixtures: fixtures.length });
  }
  console.log(JSON.stringify({ season, report }, null, 2));
}
main().catch(() => { console.error("Football-data sync preflight failed."); process.exitCode = 1; });
