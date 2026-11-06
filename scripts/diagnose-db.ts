import { and, asc, count, desc, eq, isNotNull } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { competitions, fixtures, venues } from "../src/db/schema";

async function main() {
  const db = createDb();
  const [competitionTotal, fixtureTotal, confirmedTotal, provisionalTotal, ticketTotal, linkedVenueTotal, reviewedVenueTotal, earliest, latest] = await Promise.all([
    db.$count(competitions), db.$count(fixtures), db.$count(fixtures, eq(fixtures.status, "confirmed")),
    db.$count(fixtures, eq(fixtures.status, "tentative")), db.$count(fixtures, isNotNull(fixtures.officialTicketUrl)),
    db.$count(fixtures, isNotNull(fixtures.venueId)),
    db.select({ total: count() }).from(fixtures).innerJoin(venues, eq(fixtures.venueId, venues.id)).where(and(eq(venues.reviewed, true), eq(venues.active, true))),
    db.select({ date: fixtures.kickoffDate }).from(fixtures).orderBy(asc(fixtures.kickoffDate)).limit(1),
    db.select({ date: fixtures.kickoffDate }).from(fixtures).orderBy(desc(fixtures.kickoffDate)).limit(1),
  ]);
  console.log(JSON.stringify({ competitions: competitionTotal, fixtures: fixtureTotal, confirmed: confirmedTotal, provisionalOrPostponed: provisionalTotal, officialTicketUrls: ticketTotal, linkedVenues: linkedVenueTotal, fixturesAtReviewedActiveVenues: reviewedVenueTotal[0]?.total ?? 0, earliestLocalDate: earliest[0]?.date, latestLocalDate: latest[0]?.date }));
}
main().catch((error) => { const message = error instanceof Error ? error.message : "Database diagnostic failed."; const cause = error instanceof Error && error.cause instanceof Error ? ` (${error.cause.name}: ${error.cause.message})` : ""; console.error(`${message}${cause}`); process.exitCode = 1; });
