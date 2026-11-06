import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDatabase = globalThis as unknown as { matchboundDatabase?: ReturnType<typeof drizzle<typeof schema>> };

export function createDb(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  // Reuse one client per application process. Creating one per request exhausts
  // session-mode Supabase pools long before the draw flow is under real load.
  // This is intentionally a single-database application client; callers needing
  // a separate database should run in a separate process.
  if (!globalForDatabase.matchboundDatabase) globalForDatabase.matchboundDatabase = drizzle(postgres(databaseUrl, { max: 1 }), { schema });
  return globalForDatabase.matchboundDatabase;
}

export type Database = ReturnType<typeof createDb>;
