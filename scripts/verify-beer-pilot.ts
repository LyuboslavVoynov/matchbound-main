import "dotenv/config";
import postgres from "postgres";
import {createDb} from "../src/db/client";
import {findBeerSignalsForFixture} from "../src/db/beer-signal-repository";
async function main(){
 const sql=postgres(process.env.DATABASE_URL!,{max:1});
 try {
  const counts=await sql`select count(*)::int as products, count(distinct brewery_id)::int as breweries from beer_products where approval_status='approved' and active and valid_until > now()`;
  const policies=await sql`select relname,relrowsecurity from pg_class where relname in ('beer_products','beer_breweries')`;
  const result=await findBeerSignalsForFixture(createDb(),"Germany","Munich");
  if(!result?.countryBrand?.productId)throw new Error("Product selection failed");
  const fallback=await findBeerSignalsForFixture(createDb(),"France","Lyon");
  console.info(JSON.stringify({counts,policies,selected:result.countryBrand,legacyFallback:!!fallback?.countryBrand}));
 } finally {await sql.end();}
 process.exit(0);
}
main().catch(()=>{console.error("Pilot verification failed");process.exit(1);});
