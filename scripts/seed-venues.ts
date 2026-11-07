import { createDb } from "../src/db/client";
import { venues } from "../src/db/schema";
import { reviewedVenues } from "../src/providers/venue-registry";
import { expandedLeagueVenues } from "../src/providers/expanded-league-venues";
import { selectCompetitions } from "../src/providers/football-data-registry";
import { validateVenueRegistry } from "../src/providers/venue-registry-validation";

async function main() {
  const validationErrors = validateVenueRegistry();
  if (validationErrors.length) throw new Error(`Venue registry validation failed:\n${validationErrors.join("\n")}`);
  const codes = process.argv[2];
  const selected = codes ? selectCompetitions(codes) : undefined;
  const records = selected ? expandedLeagueVenues.filter(venue => selected.some(profile => profile.code === venue.competitionCode)) : reviewedVenues;
  if (selected?.some(profile => !expandedLeagueVenues.some(venue => venue.competitionCode === profile.code))) throw new Error("Scoped seeding supports ELC, DED and PPL; omit the scope to seed the complete reviewed registry.");
  const db = createDb();
  for (const venue of records) await db.insert(venues).values({ provider: venue.provider, providerTeamId: String(venue.providerTeamId), stadium: venue.stadium, city: venue.city, country: venue.country, timezone: venue.timezone, address: venue.address, sourceUrl: venue.verificationUrl ?? venue.sourceUrl, reviewed: true, verifiedAt: new Date(venue.reviewedAt) }).onConflictDoUpdate({ target: [venues.provider, venues.providerTeamId], set: { stadium: venue.stadium, city: venue.city, country: venue.country, timezone: venue.timezone, address: venue.address, sourceUrl: venue.verificationUrl ?? venue.sourceUrl, reviewed: true, active: true, verifiedAt: new Date(venue.reviewedAt) } });
  console.info(`Seeded ${records.length} reviewed venue(s).`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
