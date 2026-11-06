import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { competitions, fixtures } from "../src/db/schema";
import { parseFixtureCsv } from "../src/fixtures/csv";

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Usage: npm run fixtures:import -- <fixtures.csv>");
  const rows = parseFixtureCsv(await readFile(path, "utf8"));
  const db = createDb();

  for (const row of rows) {
    const [competition] = await db.insert(competitions).values({ name: row.competition, country: row.competition_country, providerCompetitionCode: row.provider_competition_code || null, emblemUrl: row.competition_emblem_url || null, areaFlagUrl: row.country_flag_url || null })
      .onConflictDoUpdate({ target: [competitions.name, competitions.country], set: { active: true, providerCompetitionCode: row.provider_competition_code || null, emblemUrl: row.competition_emblem_url || null, areaFlagUrl: row.country_flag_url || null } })
      .returning({ id: competitions.id });
    await db.insert(fixtures).values({
      sourceId: row.source_id, competitionId: competition.id, kickoffAt: new Date(row.kickoff_at), kickoffDate: row.kickoff_date, timezone: row.timezone,
      homeTeamProviderId: row.home_team_provider_id || null, awayTeamProviderId: row.away_team_provider_id || null, homeTeamCrestUrl: row.home_team_crest_url || null, awayTeamCrestUrl: row.away_team_crest_url || null, homeTeam: row.home_team, awayTeam: row.away_team, city: row.city, stadium: row.stadium, officialTicketUrl: row.official_ticket_url || null, status: row.status,
    }).onConflictDoUpdate({ target: fixtures.sourceId, set: {
      competitionId: competition.id, kickoffAt: new Date(row.kickoff_at), kickoffDate: row.kickoff_date, timezone: row.timezone, homeTeamProviderId: row.home_team_provider_id || null, awayTeamProviderId: row.away_team_provider_id || null, homeTeamCrestUrl: row.home_team_crest_url || null, awayTeamCrestUrl: row.away_team_crest_url || null, homeTeam: row.home_team,
      awayTeam: row.away_team, city: row.city, stadium: row.stadium, officialTicketUrl: row.official_ticket_url || null, status: row.status, updatedAt: new Date(),
    } });
  }
  console.info(`Imported ${rows.length} fixture(s).`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
