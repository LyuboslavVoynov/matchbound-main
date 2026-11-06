import type { FixtureStatus } from "@/domain/fixtures";

/** Conservative mapping: only a provider-confirmed scheduled kickoff can enter a draw. */
export function normalizeFootballDataStatus(status: string): FixtureStatus {
  switch (status) {
    case "SCHEDULED":
    case "TIMED":
      return "confirmed";
    case "POSTPONED": return "postponed";
    case "CANCELLED": return "cancelled";
    default: return "tentative";
  }
}
