import { describe, expect, it, vi } from "vitest";
import { createFootballDataClient } from "@/providers/football-data";

describe("football-data client", () => {
  it("uses X-Auth-Token and discovers available competitions", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ competitions: [{ id: 2021, code: "PL", name: "Premier League", type: "LEAGUE", area: { name: "England" } }] }), { status: 200 }));
    const competitions = await createFootballDataClient("test-token", fetcher).getAvailableCompetitions();
    expect(competitions[0].code).toBe("PL");
    expect(fetcher).toHaveBeenCalledWith("https://api.football-data.org/v4/competitions", expect.objectContaining({ headers: expect.objectContaining({ "X-Auth-Token": "test-token" }) }));
  });
  it("rejects an absent key without making a request", () => {
    expect(() => createFootballDataClient("")).toThrow("FOOTBALL_DATA_API_KEY is required");
  });
});
