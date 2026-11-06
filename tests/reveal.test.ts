import { describe, expect, it } from "vitest";
import { REVEAL_STAGES, revealValue } from "@/domain/reveal";

const result = { competition: "Premier League", country: "England", homeTeam: "Arsenal", awayTeam: "Chelsea", kickoffDate: "2026-08-01", kickoffAt: "2026-08-01T15:00:00.000Z", timezone: "Europe/London", stadium: "Emirates Stadium", city: "London", officialTicketUrl: null } as const;

describe("persisted reveal", () => {
  it("uses the product’s fixed progressive order", () => {
    expect(REVEAL_STAGES).toEqual(["country", "city", "stadium", "match"]);
  });

  it("derives every beat from the existing result snapshot", () => {
    expect(REVEAL_STAGES.map((stage) => revealValue(stage, result))).toEqual(["England", "London", "Emirates Stadium", "Arsenal v Chelsea"]);
  });
});
