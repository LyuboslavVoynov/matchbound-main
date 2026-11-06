import { NextResponse } from "next/server";
import { z } from "zod";
import { DateRangeError, validateTripDates } from "@/domain/dates";
import { createShareToken, drawExpiresAt } from "@/domain/draw";
import { selectRandomFixture } from "@/domain/random";
import { drawVisualIdentity } from "@/domain/visual-identity";
import { createDb } from "@/db/client";
import { findBeerSignalsForFixture } from "@/db/beer-signal-repository";
import { findPlaceMediaForFixture } from "@/db/place-media-repository";
import { findEligibleFixtures, persistDraw } from "@/db/draw-repository";
import { snapshotPlaceMedia } from "@/domain/place-media";

const requestSchema = z.object({ startDate: z.string(), endDate: z.string() }).strict();

export async function POST(request: Request) {
  try {
    const dates = validateTripDates(requestSchema.parse(await request.json()));
    const db = createDb();
    const fixture = selectRandomFixture(await findEligibleFixtures(db, dates.startDate, dates.endDate));
    if (!fixture) return NextResponse.json({ error: "No eligible confirmed fixtures were found for these dates." }, { status: 404 });

    // Token collision is cryptographically negligible; the database unique index remains the final guard.
    let beerSignals;
    let placeMedia;
    try {
      beerSignals = await findBeerSignalsForFixture(db, fixture.competition.country, fixture.city);
    } catch (error) {
      // Optional editorial data must never make the core draw unavailable.
      console.warn("Beer signal lookup skipped", error);
    }
    try {
      placeMedia = snapshotPlaceMedia(await findPlaceMediaForFixture(db, fixture.competition.country, fixture.city, fixture.stadium));
    } catch (error) {
      // Visual atmosphere is optional; a media lookup must never block a draw.
      console.warn("Place media lookup skipped", error);
    }
    const visualIdentity = drawVisualIdentity({ competitionEmblemUrl: fixture.competition.emblemUrl, countryFlagUrl: fixture.competition.areaFlagUrl, homeTeamCrestUrl: fixture.homeTeamCrestUrl, awayTeamCrestUrl: fixture.awayTeamCrestUrl });
    const draw = await persistDraw(db, { shareToken: createShareToken(), fixtureId: fixture.id, startDate: dates.startDate, endDate: dates.endDate, expiresAt: drawExpiresAt(), resultSnapshot: { competition: fixture.competition.name, country: fixture.competition.country, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam, kickoffDate: fixture.kickoffDate, kickoffAt: fixture.kickoffAt.toISOString(), timezone: fixture.timezone, stadium: fixture.stadium, city: fixture.city, officialTicketUrl: fixture.officialTicketUrl, ...(visualIdentity && { visualIdentity }), ...(placeMedia && { placeMedia }), ...(beerSignals && { beerSignals }) } });
    return NextResponse.json({ shareToken: draw.shareToken, expiresAt: draw.expiresAt.toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof z.ZodError || error instanceof DateRangeError) {
      return NextResponse.json({ error: error.message || "Invalid draw request." }, { status: 400 });
    }
    console.error("Unable to create draw", error);
    return NextResponse.json({ error: "Unable to create a draw." }, { status: 500 });
  }
}
