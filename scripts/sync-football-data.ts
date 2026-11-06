import "dotenv/config";
import { createFootballDataClient } from "../src/providers/football-data";
import { SUPPORTED_COMPETITIONS } from "../src/providers/football-data-registry";
import { unresolvedVenueTeams } from "../src/providers/venue-coverage";
import { validateVenueRegistry } from "../src/providers/venue-registry-validation";

async function main() {
  const validationErrors = validateVenueRegistry();
  if (validationErrors.length) throw new Error(`Venue registry validation failed:\n${validationErrors.join("\n")}`);
  const client = createFootballDataClient(); const season = Number(process.argv[2] ?? 2026); const report = [];
  for (const competition of SUPPORTED_COMPETITIONS) {
    const teams = await client.getCompetitionTeams(competition.code); const unresolved = unresolvedVenueTeams(teams);
    if (unresolved.length) { report.push({ competition: competition.code, action: "blocked_missing_reviewed_venues_or_roster_contract", teams: teams.length, unresolved: unresolved.map((team) => team.id) }); continue; }
    const fixtures = await client.getCompetitionMatches(competition.code, season);
    report.push({ competition: competition.code, action: "ready_for_fixture_upsert", teams: teams.length, fixtures: fixtures.length });
  }
  console.log(JSON.stringify({ season, report }, null, 2));
}
main().catch(() => { console.error("Football-data sync preflight failed."); process.exitCode = 1; });
