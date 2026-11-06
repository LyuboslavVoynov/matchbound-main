import { describe, expect, it } from "vitest";
import { hasFullVenueCoverage, unresolvedVenueTeams } from "@/providers/venue-coverage";
describe("venue coverage gate", () => {
  const arsenal = { id: 57, name: "Arsenal FC", shortName: "Arsenal", venue: "Emirates Stadium", address: "London" };
  const unknown = { id: 999, name: "Unknown FC", shortName: "Unknown", venue: "Unknown", address: "Unknown" };
  const renamed = { ...arsenal, name: "Arsenal Renamed" };

  it("permits only complete reviewed team coverage", () => {
    expect(hasFullVenueCoverage([arsenal])).toBe(true);
    expect(hasFullVenueCoverage([arsenal, unknown])).toBe(false);
    expect(unresolvedVenueTeams([arsenal, unknown]).map((team) => team.id)).toEqual([999]);
  });

  it("blocks a provider roster name that no longer matches the reviewed contract", () => {
    expect(hasFullVenueCoverage([renamed])).toBe(false);
    expect(unresolvedVenueTeams([renamed]).map((team) => team.id)).toEqual([57]);
  });
});
