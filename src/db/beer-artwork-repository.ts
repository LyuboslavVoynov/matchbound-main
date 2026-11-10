import {and,eq,isNotNull} from "drizzle-orm";
import type {Database} from "./client";
import {beerProductArtwork,beerProducts,beerBreweries,creativeAssets} from "./schema";
import {approvedCreativeUrl,reusableCreativeLicense,safeHttps} from "@/domain/creative-library";
import type {BeerArtwork} from "@/domain/beer-artwork";

/** Optional art is resolved separately from the immutable beer selection. */
export async function findProductBeerArtwork(db:Database,productId:string|undefined,country:string):Promise<BeerArtwork|undefined>{
 const base=process.env.SUPABASE_URL;if(!base||!productId)return undefined;
 try{
  const [row]=await db.select({asset:creativeAssets,kind:beerProductArtwork.kind,productId:beerProducts.id,name:beerProducts.name,breweryName:beerBreweries.name,country:beerBreweries.originNation}).from(beerProductArtwork)
   .innerJoin(creativeAssets,eq(beerProductArtwork.assetId,creativeAssets.id)).innerJoin(beerProducts,eq(beerProductArtwork.productId,beerProducts.id)).innerJoin(beerBreweries,eq(beerProducts.breweryId,beerBreweries.id))
   .where(and(eq(beerProductArtwork.productId,productId),eq(beerBreweries.originNation,country),eq(beerProductArtwork.active,true),eq(creativeAssets.active,true),eq(creativeAssets.approvalStatus,"approved"),isNotNull(creativeAssets.publishedAt),isNotNull(creativeAssets.reviewedAt))).limit(1);
  if(!row||row.productId!==productId||row.country!==country)return undefined;
  const a=row.asset;const src=approvedCreativeUrl(a.imageUrl,base,process.env.SUPABASE_CREATIVE_BUCKET??"matchbound-creatives");
  if(!src||!a.active||a.approvalStatus!=="approved"||!a.publishedAt||!a.reviewedAt||!safeHttps(a.sourcePageUrl)||!reusableCreativeLicense(a.licenseName,a.licenseUrl)||!["product-photo","product-logo","brewery-logo"].includes(row.kind))return undefined;
  return {country,brand:row.name.toLowerCase().startsWith(row.breweryName.toLowerCase()+" ")?row.name:row.breweryName+" "+row.name,src,source:a.sourcePageUrl,author:a.creator,license:a.licenseName,licenseUrl:a.licenseUrl,kind:row.kind,note:a.transformationNote};
 }catch{return undefined;}
}
