export type FixtureStatus = "confirmed" | "tentative" | "postponed" | "cancelled";
export type EligibleFixture = Readonly<{
  id: string;
  kickoffDate: string;
  status: FixtureStatus;
  competition: Readonly<{ gender: "men" | "women" | "mixed"; region: string; format: "club" | "international" }>;
}>;

/** Applies Matchbound's business eligibility rules independently of storage. */
export function getEligibleFixtures<T extends EligibleFixture>(fixtures: readonly T[], startDate: string, endDate: string): T[] {
  return fixtures.filter((fixture) =>
    fixture.status === "confirmed" &&
    fixture.competition.gender === "men" &&
    fixture.competition.region === "Europe" &&
    fixture.competition.format === "club" &&
    fixture.kickoffDate >= startDate && fixture.kickoffDate <= endDate,
  );
}
