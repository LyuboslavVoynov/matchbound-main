import { reviewedVenues, type VenueRecord } from "./venue-registry";
import { REVIEWED_TEAM_NAMES } from "./reviewed-team-contract";

function isValidTimezone(timezone: string) {
  try { new Intl.DateTimeFormat("en", { timeZone: timezone }); return true; } catch { return false; }
}

export function validateVenueRegistry(records: readonly VenueRecord[] = reviewedVenues): string[] {
  const seen = new Set<number>();
  const errors: string[] = [];
  for (const record of records) {
    if (seen.has(record.providerTeamId)) errors.push(`Duplicate provider team ID: ${record.providerTeamId}`);
    seen.add(record.providerTeamId);
    if (record.provider !== "football-data") errors.push(`Unexpected provider for team ${record.providerTeamId}`);
    if (![record.stadium, record.city, record.country, record.sourceUrl, record.reviewedAt].every((value) => value.trim())) errors.push(`Missing required venue data for team ${record.providerTeamId}`);
    if (!record.sourceUrl.endsWith(`/teams/${record.providerTeamId}`)) errors.push(`Unexpected source URL for team ${record.providerTeamId}`);
    if (record.verificationUrl) {
      try {
        const evidence = new URL(record.verificationUrl);
        if (evidence.protocol !== "https:" || evidence.username || evidence.password) errors.push(`Invalid verification URL for team ${record.providerTeamId}`);
      } catch { errors.push(`Invalid verification URL for team ${record.providerTeamId}`); }
    }
    if (Number.isNaN(Date.parse(record.reviewedAt))) errors.push(`Invalid review date for team ${record.providerTeamId}`);
    if (!isValidTimezone(record.timezone)) errors.push(`Invalid timezone for team ${record.providerTeamId}`);
    if (!REVIEWED_TEAM_NAMES[record.providerTeamId]) errors.push(`Missing reviewed team name for team ${record.providerTeamId}`);
  }
  for (const providerTeamId of Object.keys(REVIEWED_TEAM_NAMES).map(Number)) {
    if (!records.some((record) => record.providerTeamId === providerTeamId)) errors.push(`Missing reviewed venue for contracted team ${providerTeamId}`);
  }
  return errors;
}
