import { describe, expect, it, vi } from "vitest";
vi.mock("@/db/client", () => ({ createDb: vi.fn(() => ({})) }));
vi.mock("@/db/draw-repository", () => ({ findEligibleFixtures: vi.fn(), persistDraw: vi.fn() }));
vi.mock("@/db/beer-signal-repository", () => ({ findBeerSignalsForFixture: vi.fn() }));
vi.mock("@/providers/head-to-head", () => ({ findHeadToHeadForFixture: vi.fn() }));
import { POST } from "@/app/api/draw/route";
import { findEligibleFixtures, persistDraw } from "@/db/draw-repository";
import { findBeerSignalsForFixture } from "@/db/beer-signal-repository";

describe("venue destination in persisted draws", () => {
  it("persists Wales and does not borrow England's flag or beer provenance", async () => {
    vi.mocked(findEligibleFixtures).mockResolvedValue([{
      id: "fixture", sourceId: "football-data:123", homeTeamProviderId: "72", awayTeamProviderId: "715", kickoffDate: "2026-11-07", status: "confirmed", kickoffAt: new Date("2026-11-07T15:00:00Z"), timezone: "Europe/London", country: "Wales", city: "Swansea", stadium: "Swansea.com Stadium", homeTeam: "Swansea City AFC", awayTeam: "Cardiff City FC", homeTeamCrestUrl: "https://crests.football-data.org/72.png", awayTeamCrestUrl: "https://crests.football-data.org/715.png", officialTicketUrl: null,
      competition: { name: "Championship", country: "England", emblemUrl: "https://crests.football-data.org/ELC.png", areaFlagUrl: "https://crests.football-data.org/770.svg", gender: "men", region: "Europe", format: "club" },
    }]);
    vi.mocked(persistDraw).mockResolvedValue({ id: "draw", shareToken: "test-token", expiresAt: new Date("2026-11-14T00:00:00Z") });
    const response = await POST(new Request("http://localhost/api/draw", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ startDate: "2026-11-07", endDate: "2026-11-09" }) }));
    expect(response.status).toBe(201);
    const snapshot = vi.mocked(persistDraw).mock.calls[0][1].resultSnapshot;
    expect(snapshot).toMatchObject({ country: "Wales", city: "Swansea", competition: "Championship" });
    expect(snapshot.visualIdentity?.countryFlagUrl).toBeUndefined();
    expect(snapshot.visualIdentity?.homeTeamCrestUrl).toContain("72.png");
    expect(findBeerSignalsForFixture).toHaveBeenCalledWith(expect.anything(), "Wales", "Swansea");
  });
});
