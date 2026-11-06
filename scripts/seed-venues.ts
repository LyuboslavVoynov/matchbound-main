import { createDb } from "../src/db/client";
import { venues } from "../src/db/schema";
import { reviewedVenues } from "../src/providers/venue-registry";
import { validateVenueRegistry } from "../src/providers/venue-registry-validation";

async function main() {
  const validationErrors = validateVenueRegistry();
  if (validationErrors.length) throw new Error(`Venue registry validation failed:\n${validationErrors.join("\n")}`);
  const db = createDb();
  for (const venue of reviewedVenues) await db.insert(venues).values({ provider: venue.provider, providerTeamId: String(venue.providerTeamId), stadium: venue.stadium, city: venue.city, country: venue.country, timezone: venue.timezone, address: venue.address, sourceUrl: venue.sourceUrl, reviewed: true, verifiedAt: new Date(venue.reviewedAt) }).onConflictDoUpdate({ target: [venues.provider, venues.providerTeamId], set: { stadium: venue.stadium, city: venue.city, country: venue.country, timezone: venue.timezone, address: venue.address, sourceUrl: venue.sourceUrl, reviewed: true, active: true, verifiedAt: new Date(venue.reviewedAt) } });
  console.info(`Seeded ${reviewedVenues.length} reviewed venue(s).`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
