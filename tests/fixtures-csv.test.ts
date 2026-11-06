import { describe, expect, it } from "vitest";
import { parseFixtureCsv } from "@/fixtures/csv";

describe("development fixture CSV enrichment", () => {
  it("accepts optional provider visual identity metadata", () => {
    const [fixture] = parseFixtureCsv([
      "source_id,competition,competition_country,provider_competition_code,competition_emblem_url,country_flag_url,kickoff_at,kickoff_date,timezone,home_team,away_team,city,stadium,home_team_provider_id,away_team_provider_id,home_team_crest_url,away_team_crest_url,status,official_ticket_url",
      "dev-example,Premier League,England,PL,https://crests.football-data.org/PL.png,https://crests.football-data.org/770.svg,2026-08-01T15:00:00+01:00,2026-08-01,Europe/London,Arsenal,West Ham United,London,Emirates Stadium,57,563,https://crests.football-data.org/57.png,https://crests.football-data.org/563.png,confirmed,",
    ].join("\n"));

    expect(fixture).toMatchObject({
      provider_competition_code: "PL",
      home_team_provider_id: "57",
      away_team_provider_id: "563",
      home_team_crest_url: "https://crests.football-data.org/57.png",
      away_team_crest_url: "https://crests.football-data.org/563.png",
    });
  });
});
