import { and, eq, gte, inArray, lte, or } from "drizzle-orm";
import type { Database } from "./client";
import { competitions, draws, fixtures, venues } from "./schema";
import { getEligibleFixtures } from "@/domain/fixtures";
import type { DrawResultSnapshot } from "@/domain/result";

export async function findEligibleFixtures(db: Database, startDate: string, endDate: string) {
  // CSV fixtures are allowed only in local development. Production draws require a reviewed canonical venue.
  const localDevelopmentDataAllowed = process.env.NODE_ENV !== "production";
  const candidates = await db.select({
    id: fixtures.id, sourceId: fixtures.sourceId, homeTeamProviderId: fixtures.homeTeamProviderId, awayTeamProviderId: fixtures.awayTeamProviderId, kickoffDate: fixtures.kickoffDate, status: fixtures.status, kickoffAt: fixtures.kickoffAt, timezone: venues.timezone, homeTeam: fixtures.homeTeam, awayTeam: fixtures.awayTeam, homeTeamCrestUrl: fixtures.homeTeamCrestUrl, awayTeamCrestUrl: fixtures.awayTeamCrestUrl, stadium: venues.stadium, city: venues.city, officialTicketUrl: fixtures.officialTicketUrl,
    competition: { name: competitions.name, country: competitions.country, emblemUrl: competitions.emblemUrl, areaFlagUrl: competitions.areaFlagUrl, gender: competitions.gender, region: competitions.region, format: competitions.format },
  }).from(fixtures).innerJoin(competitions, eq(fixtures.competitionId, competitions.id)).innerJoin(venues, eq(fixtures.venueId, venues.id))
    .where(and(gte(fixtures.kickoffDate, startDate), lte(fixtures.kickoffDate, endDate), inArray(fixtures.status, ["confirmed"]), eq(venues.active, true), localDevelopmentDataAllowed ? or(eq(venues.reviewed, true), eq(venues.provider, "development")) : eq(venues.reviewed, true)));
  return getEligibleFixtures(candidates, startDate, endDate);
}

export async function persistDraw(db: Database, values: { shareToken: string; fixtureId: string; startDate: string; endDate: string; expiresAt: Date; resultSnapshot: DrawResultSnapshot }) {
  const [draw] = await db.insert(draws).values({
    shareToken: values.shareToken, fixtureId: values.fixtureId,
    tripStartDate: values.startDate, tripEndDate: values.endDate, expiresAt: values.expiresAt, resultSnapshot: values.resultSnapshot,
  }).returning({ id: draws.id, shareToken: draws.shareToken, expiresAt: draws.expiresAt });
  return draw;
}

export async function findSharedDraw(db: Database, shareToken: string) {
  const [row] = await db.select({ expiresAt: draws.expiresAt, resultSnapshot: draws.resultSnapshot }).from(draws).where(eq(draws.shareToken, shareToken));
  return row;
}

