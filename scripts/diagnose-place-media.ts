import { createDb } from "../src/db/client";
import { sql } from "drizzle-orm";
import { placeMedia } from "../src/db/schema";
import { draws } from "../src/db/schema";
import { desc } from "drizzle-orm";

async function main() {
  const db = createDb();
  const table = await db.execute(sql`select table_name from information_schema.tables where table_schema = 'public' and table_name = 'place_media'`);
  const latestMigration = await db.execute(sql`select created_at from drizzle.__drizzle_migrations order by created_at desc limit 1`);
  const records = table.length === 1 ? await db.select({ id: placeMedia.id }).from(placeMedia) : [];
  const [latestDraw] = await db.select({ resultSnapshot: draws.resultSnapshot }).from(draws).orderBy(desc(draws.createdAt)).limit(1);
  console.info(JSON.stringify({ placeMediaTablePresent: table.length === 1, placeMediaRecordCount: records.length, latestMigrationRecorded: latestMigration.length === 1, latestDraw: latestDraw && { hasPlaceMedia: Boolean(latestDraw.resultSnapshot.placeMedia), mediaSubjects: Object.keys(latestDraw.resultSnapshot.placeMedia ?? {}) } }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
