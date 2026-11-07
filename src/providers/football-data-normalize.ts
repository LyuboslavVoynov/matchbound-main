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

/** Match calendar dates follow the reviewed stadium timezone, including island offsets. */
export function localFixtureDate(utcDate: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(utcDate));
  const value = (type: string) => parts.find(part => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
