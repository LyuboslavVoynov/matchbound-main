import { NextResponse } from "next/server";
import { z } from "zod";
import { DateRangeError, validateTripDates } from "@/domain/dates";
import { createShareToken, drawExpiresAt } from "@/domain/draw";
import { selectRandomFixture } from "@/domain/random";
import { fixtureDestination } from "@/domain/fixture-destination";
import { drawVisualIdentity } from "@/domain/visual-identity";
import { createDb } from "@/db/client";
import { findBeerSignalsForFixture } from "@/db/beer-signal-repository";
import { findEligibleFixtures, persistDraw } from "@/db/draw-repository";

import { findHeadToHeadForFixture } from "@/providers/head-to-head";

const requestSchema = z.object({ startDate: z.string(), endDate: z.string(), includeUK: z.boolean().default(true) }).strict();

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const dates = validateTripDates(input);
    const db = createDb();
    const fixture = selectRandomFixture(await findEligibleFixtures(db, dates.startDate, dates.endDate, { includeUK: input.includeUK }));
    if (!fixture) return NextResponse.json({ error: input.includeUK ? "No eligible confirmed fixtures were found for these dates." : "No eligible confirmed fixtures outside the UK were found for these dates. Try different dates or include UK matches." }, { status: 404 });

    const destination = fixtureDestination(fixture.country, fixture.competition);

    // Token collision is cryptographically negligible; the database unique index remains the final guard.
    let beerSignals;
    try {
      beerSignals = await findBeerSignalsForFixture(db, destination.country, fixture.city);
    } catch (error) {
      // Optional editorial data must never make the core draw unavailable.
      console.warn("Beer signal lookup skipped", error);
    }
    const headToHead = await findHeadToHeadForFixture(fixture, new Date());
    const visualIdentity = drawVisualIdentity({ competitionEmblemUrl: fixture.competition.emblemUrl, countryFlagUrl: destination.countryFlagUrl, homeTeamCrestUrl: fixture.homeTeamCrestUrl, awayTeamCrestUrl: fixture.awayTeamCrestUrl });
    const draw = await persistDraw(db, { shareToken: createShareToken(), fixtureId: fixture.id, startDate: dates.startDate, endDate: dates.endDate, expiresAt: drawExpiresAt(), resultSnapshot: { competition: fixture.competition.name, country: destination.country, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam, kickoffDate: fixture.kickoffDate, kickoffAt: fixture.kickoffAt.toISOString(), timezone: fixture.timezone, stadium: fixture.stadium, city: fixture.city, officialTicketUrl: fixture.officialTicketUrl, ...(visualIdentity && { visualIdentity }), ...(beerSignals && { beerSignals }), ...(headToHead && { headToHead }) } });
    return NextResponse.json({ shareToken: draw.shareToken, expiresAt: draw.expiresAt.toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof z.ZodError || error instanceof DateRangeError) {
      return NextResponse.json({ error: error.message || "Invalid draw request." }, { status: 400 });
    }
    console.error("Unable to create draw", error);
    return NextResponse.json({ error: "Unable to create a draw." }, { status: 500 });
  }
}
