import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { createDb } from "@/db/client";
import { draws } from "@/db/schema";
import type { DrawResultSnapshot } from "@/domain/result";

export async function saveMatchdayDraw(options: { longNames?: boolean; noExtras?: boolean; oneMeeting?: boolean; expired?: boolean; country?: string; beer?: "brand" | "price" | "both" | "none" } = {}) {
  const db = createDb();
  const fixture = await db.query.fixtures.findFirst();
  if (!fixture) throw new Error("Expected a development fixture.");
  const token = randomBytes(24).toString("base64url");
  const home = options.longNames ? "Borussia Verein für Leibesübungen Mönchengladbach" : "Arsenal";
  const away = options.longNames ? "Real Sociedad de Fútbol San Sebastián" : "Chelsea";
  const match = (id: number, reverse: boolean, homeScore: number, awayScore: number) => ({ id, kickoffAt: `2026-0${id}-01T15:00:00Z`, competition: "Premier League", homeTeam: reverse ? away : home, awayTeam: reverse ? home : away, homeTeamId: reverse ? 2 : 1, awayTeamId: reverse ? 1 : 2, homeScore, awayScore });
  const meetings = options.oneMeeting ? [match(1, false, 1, 1)] : [match(3, false, 3, 0), match(2, true, 2, 1), match(1, false, 1, 1)];
  const price = { servingLabel: "0.5 L draft beer", averagePriceMinor: 490, currency: "EUR", metricDefinition: "City average for a 0.5 L draft beer", observedAt: "2026-08-29T00:00:00.000Z" };
  const brand = { countryName: "England", brandName: "London Pride", originStatement: "A Chiswick, London original." };
  const beerSignals = options.beer === "none" ? undefined : {
    ...(options.beer === "price" || options.beer === "both" ? { cityAverage: price } : {}),
    ...(options.beer !== "price" ? { countryBrand: brand } : {}),
  };
  const result: DrawResultSnapshot = {
    homeTeam: home, awayTeam: away, city: options.longNames ? "Mönchengladbach" : "London", country: options.country ?? (options.longNames ? "Germany" : "England"), stadium: options.longNames ? "Stadion im Borussia-Park, Mönchengladbach" : "Emirates Stadium",
    competition: options.longNames ? "Fußball-Bundesliga, Deutschland" : "Premier League", kickoffAt: "2026-11-29T16:30:00Z", kickoffDate: "2026-11-29", timezone: "Europe/London", officialTicketUrl: "https://www.arsenal.com/tickets",
    ...(!options.noExtras && {
      visualIdentity: { countryFlagUrl: "https://crests.football-data.org/770.svg", competitionEmblemUrl: "https://crests.football-data.org/PL.png", homeTeamCrestUrl: "https://crests.football-data.org/57.png", awayTeamCrestUrl: "https://crests.football-data.org/61.png" },
      headToHead: { asOf: "2026-11-06T00:00:00Z", homeTeamId: 1, awayTeamId: 2, homeWins: 99, draws: 99, awayWins: 99, meetings },
      beerSignals,
    }),
  };
  await db.insert(draws).values({ shareToken: token, fixtureId: fixture.id, tripStartDate: "2026-11-27", tripEndDate: "2026-11-29", expiresAt: new Date(Date.now() + (options.expired ? -1 : 86400000)), resultSnapshot: result });
  return { token, result, cleanup: () => db.delete(draws).where(eq(draws.shareToken, token)) };
}
