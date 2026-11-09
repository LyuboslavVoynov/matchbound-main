import "dotenv/config";
import postgres from "postgres";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
async function main(){
 if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
 const sql=postgres(process.env.DATABASE_URL,{max:1});
 try {
  const migration=await readFile("drizzle/0017_beer_product_catalogue.sql","utf8");
  const journal=JSON.parse(await readFile("drizzle/meta/_journal.json","utf8"));
  const timestamp=journal.entries.find((e:{tag:string})=>e.tag==="0017_beer_product_catalogue").when;
  const hash=createHash("sha256").update(migration).digest("hex");
  await sql.begin(async tx=>{
   const existing=await tx`select hash from drizzle.__drizzle_migrations where created_at=${timestamp}`;
   if(existing.length){if(existing[0].hash!==hash) throw new Error("Migration hash mismatch");return;}
   const [{exists}]=await tx`select to_regclass('public.beer_products') is not null as exists`;
   if(exists) throw new Error("Untracked existing catalogue; inspect before migration");
   for(const statement of migration.split("--> statement-breakpoint")) await tx.unsafe(statement);
   await tx`insert into drizzle.__drizzle_migrations (hash,created_at) values (${hash},${timestamp})`;
  });
  console.info("Migration 0017 applied or verified; existing application tables preserved.");
 } finally {await sql.end();}
}
main().catch(()=>{console.error("Beer pilot migration failed; no credentials logged.");process.exitCode=1;});
