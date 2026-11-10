import "dotenv/config";
import {readFile} from "node:fs/promises";
import {and,eq} from "drizzle-orm";
import {createDb} from "../src/db/client";
import {beerBreweries,beerProducts,beerProductArtwork,creativeAssets} from "../src/db/schema";
import {beerProductArtworkSchema} from "../src/domain/beer-product-artwork";
import {approvedCreativeUrl,reusableCreativeLicense} from "../src/domain/creative-library";
async function main(){
 const args=process.argv.slice(2);if(args.some(a=>a!=="--apply"))throw Error("Unknown option");
 const manifest=beerProductArtworkSchema.parse(JSON.parse(await readFile("src/data/beer-product-artwork.json","utf8")));
 console.info(JSON.stringify({approvedMappings:manifest.assets.filter(a=>a.approvalStatus==="approved").length,mode:args.includes("--apply")?"apply":"dry-run"}));
 if(!args.includes("--apply"))return;
 const db=createDb();
 try{await db.transaction(async tx=>{
  for(const artwork of manifest.assets.filter(a=>a.approvalStatus==="approved")){
   const [product]=await tx.select({country:beerBreweries.originNation}).from(beerProducts).innerJoin(beerBreweries,eq(beerProducts.breweryId,beerBreweries.id)).where(eq(beerProducts.id,artwork.productId));
   if(product?.country!==artwork.country)throw Error("Product-country mismatch");
   const id="beer-art-"+artwork.productId+"-v1";
   const [asset]=await tx.select().from(creativeAssets).where(and(eq(creativeAssets.id,id),eq(creativeAssets.approvalStatus,"approved"),eq(creativeAssets.active,true)));
   if(!asset?.publishedAt||!asset.reviewedAt||asset.contentSha256!==artwork.sha256||!reusableCreativeLicense(asset.licenseName,asset.licenseUrl)||!approvedCreativeUrl(asset.imageUrl,process.env.SUPABASE_URL,process.env.SUPABASE_CREATIVE_BUCKET??"matchbound-creatives"))throw Error("Publish and verify exact approved artwork bytes first");
   const record={productId:artwork.productId,assetId:id,kind:artwork.kind,active:true};
   await tx.insert(beerProductArtwork).values(record).onConflictDoUpdate({target:beerProductArtwork.productId,set:record});
  }
 });console.info("Reviewed product artwork mappings imported atomically.");}finally{await db.$client.end();}
}
main().catch(()=>{console.error("Beer artwork import failed; verify migration, identity and approved publication. No credentials logged.");process.exitCode=1});
