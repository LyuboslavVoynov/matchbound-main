import "dotenv/config";
import { and, eq, inArray, sql } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { competitions, fixtures, venues } from "../src/db/schema";
import { createFootballDataClient, type FootballDataMatch } from "../src/providers/football-data";
import { normalizeFootballDataStatus } from "../src/providers/football-data-normalize";
import { SUPPORTED_COMPETITIONS } from "../src/providers/football-data-registry";
import { unresolvedVenueTeams } from "../src/providers/venue-coverage";
import { validateVenueRegistry } from "../src/providers/venue-registry-validation";

function localDate(utcDate: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(utcDate));
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

async function main() {
  const season = Number(process.argv[2] ?? 2026);
  const errors = validateVenueRegistry();
  if (errors.length) throw new Error(`Venue registry validation failed:\n${errors.join("\n")}`);

  const client = createFootballDataClient();
  const payload = [] as { code: string; name: string; country: string; matches: FootballDataMatch[] }[];
  for (const profile of SUPPORTED_COMPETITIONS) {
    // Check the actual provider roster before fetching matches. A provider roster
    // change must block the complete transaction, even if a changed club has no match.
    const teams = await client.getCompetitionTeams(profile.code);
    const unresolved = unresolvedVenueTeams(teams);
    if (unresolved.length) throw new Error(`${profile.code} has unreviewed or changed teams: ${unresolved.map((team) => team.id).join(", ")}`);
    const matches = await client.getCompetitionMatches(profile.code, season);
    payload.push({ ...profile, matches });
  }

  const db = createDb();
  const homeTeamIds = [...new Set(payload.flatMap((competition) => competition.matches.map((match) => String(match.homeTeam.id))))];
  const venueRows = await db.select({ id: venues.id, providerTeamId: venues.providerTeamId, stadium: venues.stadium, city: venues.city, timezone: venues.timezone }).from(venues)
    .where(and(eq(venues.provider, "football-data"), eq(venues.reviewed, true), eq(venues.active, true), inArray(venues.providerTeamId, homeTeamIds)));
  const venueByTeamId = new Map(venueRows.map((venue) => [venue.providerTeamId, venue]));
  if (venueByTeamId.size !== homeTeamIds.length) throw new Error("Reviewed venue database records are incomplete; reseed venues before syncing fixtures.");

  console.info(`Provider payload verified for ${payload.reduce((count, competition) => count + competition.matches.length, 0)} fixture(s).`);
  await db.transaction(async (tx) => {
    for (const profile of payload) {
      const representativeMatch = profile.matches[0];
      const providerCompetition = representativeMatch?.competition;
      const providerArea = representativeMatch?.area;
      const [competition] = await tx.insert(competitions).values({
        name: profile.name, country: profile.country, provider: "football-data",
        providerCompetitionId: providerCompetition ? String(providerCompetition.id) : null,
        providerCompetitionCode: profile.code,
        providerAreaId: providerArea ? String(providerArea.id) : null,
        providerAreaCode: providerArea?.code ?? null,
        emblemUrl: providerCompetition?.emblem ?? null,
        areaFlagUrl: providerArea?.flag ?? null,
        active: true,
      }).onConflictDoUpdate({ target: [competitions.name, competitions.country], set: {
        provider: "football-data",
        providerCompetitionId: providerCompetition ? String(providerCompetition.id) : null,
        providerCompetitionCode: profile.code,
        providerAreaId: providerArea ? String(providerArea.id) : null,
        providerAreaCode: providerArea?.code ?? null,
        emblemUrl: providerCompetition?.emblem ?? null,
        areaFlagUrl: providerArea?.flag ?? null,
        active: true,
      } }).returning({ id: competitions.id });
      const fixtureValues = profile.matches.map((match) => {
        const venue = venueByTeamId.get(String(match.homeTeam.id));
        if (!venue) throw new Error(`Missing reviewed home venue for provider team ${match.homeTeam.id}`);
        return { sourceId: `football-data:${match.id}`, providerStatus: match.status, competitionId: competition.id, venueId: venue.id, kickoffAt: new Date(match.utcDate), kickoffDate: localDate(match.utcDate, venue.timezone), timezone: venue.timezone, homeTeamProviderId: String(match.homeTeam.id), awayTeamProviderId: String(match.awayTeam.id), homeTeamCrestUrl: match.homeTeam.crest, awayTeamCrestUrl: match.awayTeam.crest, homeTeam: match.homeTeam.name, awayTeam: match.awayTeam.name, city: venue.city, stadium: venue.stadium, officialTicketUrl: null, status: normalizeFootballDataStatus(match.status) };
      });
      if (fixtureValues.length) await tx.insert(fixtures).values(fixtureValues)
        .onConflictDoUpdate({ target: fixtures.sourceId, set: {
          providerStatus: sql`excluded.provider_status`, competitionId: sql`excluded.competition_id`, venueId: sql`excluded.venue_id`, kickoffAt: sql`excluded.kickoff_at`, kickoffDate: sql`excluded.kickoff_date`, timezone: sql`excluded.timezone`, homeTeamProviderId: sql`excluded.home_team_provider_id`, awayTeamProviderId: sql`excluded.away_team_provider_id`, homeTeamCrestUrl: sql`excluded.home_team_crest_url`, awayTeamCrestUrl: sql`excluded.away_team_crest_url`, homeTeam: sql`excluded.home_team`, awayTeam: sql`excluded.away_team`, city: sql`excluded.city`, stadium: sql`excluded.stadium`, status: sql`excluded.status`, updatedAt: new Date(),
        } });
    }
  });
  console.info(`Synced ${payload.reduce((count, competition) => count + competition.matches.length, 0)} fixture(s) for ${season}.`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
