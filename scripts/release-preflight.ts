import "dotenv/config";
import { sql } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { SUPPORTED_COMPETITIONS } from "../src/providers/football-data-registry";
import { findJournalVisuals } from "../src/db/creative-repository";

/** Read-only data/configuration audit of the explicitly configured validation environment. */
async function main() {
  const db = createDb();
  try {
    const today = new Date().toISOString().slice(0, 10);
    const fixtureCoverage = await db.execute(sql`
      select c.provider_competition_code as code, count(*)::int as future_confirmed_fixtures
      from fixtures f join competitions c on c.id=f.competition_id join venues v on v.id=f.venue_id
      where c.active and v.active and v.reviewed and f.status='confirmed' and f.kickoff_date >= ${today}
      group by c.provider_competition_code order by c.provider_competition_code
    `);
    const missingLeagues = SUPPORTED_COMPETITIONS.filter(profile => !fixtureCoverage.some(row => row.code === profile.code)).map(profile => profile.code);
    const beerCoverage = await db.execute(sql`
      select b.origin_nation as country, count(*)::int as approved_products
      from beer_products p join beer_breweries b on b.id=p.brewery_id
      where p.active and p.approval_status='approved' and p.valid_until > now()
      group by b.origin_nation order by b.origin_nation
    `);
    const [creativeCoverage] = await db.execute(sql`
      select (select count(*)::int from creative_assets where active and approval_status='approved' and published_at is not null) as published_assets,
             (select count(*)::int from creative_placements p join creative_assets a on a.id=p.asset_id where p.active and a.active and a.approval_status='approved' and a.published_at is not null) as published_placements
    `);
    const photos = await findJournalVisuals(db, { country: "Portugal", city: "Rio Maior", stadium: "Estádio Municipal de Rio Maior" });
    const rioMaiorRemoteLookup = !!photos.stadium?.src.includes("/storage/v1/object/public/");
    console.info(JSON.stringify({
      checkedAt: new Date().toISOString(), scope: "Configured validation database and local server environment; not Vercel environment inspection",
      enabledLeagues: SUPPORTED_COMPETITIONS.map(profile => profile.code), fixtureCoverage, missingLeagues,
      beerCoverage, creativeCoverage,
      localArtworkConfig: { publicOriginPresent: !!process.env.SUPABASE_URL, bucket: process.env.SUPABASE_CREATIVE_BUCKET ?? "matchbound-creatives" },
      rioMaiorRemoteLookup,
    }, null, 2));
    if (missingLeagues.length || !rioMaiorRemoteLookup) process.exitCode = 1;
  } finally { await db.$client.end(); }
}

main().catch(() => { console.error("Release preflight failed; check database access and configuration. No credentials logged."); process.exitCode = 1; });
