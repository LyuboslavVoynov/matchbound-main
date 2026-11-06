import { describe, expect, it } from "vitest";
import { trustedVenueForTeam } from "@/providers/venue-registry";
import { validateVenueRegistry } from "@/providers/venue-registry-validation";

describe("venue registry", () => {
  it("returns reviewed venue details without inventing unresolved data", () => {
    expect(trustedVenueForTeam(57)).toMatchObject({ stadium: "Emirates Stadium", city: "London", timezone: "Europe/London" });
    expect(trustedVenueForTeam(999999)).toBeUndefined();
  });

  it("rejects malformed or duplicate reviewed records", () => {
    expect(validateVenueRegistry()).toEqual([]);
    const arsenal = trustedVenueForTeam(57)!;
    expect(validateVenueRegistry([arsenal, { ...arsenal, stadium: "", reviewedAt: "not-a-date" }])).toEqual(expect.arrayContaining([
      "Duplicate provider team ID: 57",
      "Missing required venue data for team 57",
      "Invalid review date for team 57",
    ]));
  });
});
