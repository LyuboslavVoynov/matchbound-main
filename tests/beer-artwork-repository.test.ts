import {afterEach,describe,expect,it,vi} from "vitest";
import {findProductBeerArtwork} from "@/db/beer-artwork-repository";
import type {Database} from "@/db/client";
import {creativePublicUrl} from "@/domain/creative-library";
const row=()=>({productId:"augustiner-2",name:"Edelstoff",breweryName:"Augustiner",country:"Germany",kind:"product-photo",asset:{imageUrl:creativePublicUrl("https://example.supabase.co","matchbound-creatives","journal/beer-art-augustiner-2-v1/"+"a".repeat(64)+".webp"),active:true,approvalStatus:"approved",publishedAt:new Date(),reviewedAt:new Date(),sourcePageUrl:"https://commons.wikimedia.org/wiki/File:Product.jpg",creator:"Photographer",licenseName:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",transformationNote:"Resized; historical packaging."}});
const dbReturning=(rows:unknown[],reject=false)=>{const chain={from:()=>chain,innerJoin:()=>chain,where:()=>chain,limit:async()=>{if(reject)throw Error("Unavailable");return rows;}};return {select:()=>chain} as unknown as Database;};
afterEach(()=>vi.unstubAllEnvs());
describe("optional reviewed beer artwork",()=>{
 it("resolves a verified exact product photo and its credits",async()=>{
  vi.stubEnv("SUPABASE_URL","https://example.supabase.co");const r=row();const result=await findProductBeerArtwork(dbReturning([r]),"augustiner-2","Germany");
  expect(result).toMatchObject({src:r.asset.imageUrl,brand:"Augustiner Edelstoff",author:"Photographer",kind:"product-photo",license:"CC BY-SA 3.0"});
 });
 it("retains a usable ticket when configuration, mapping or optional storage is unavailable",async()=>{
  vi.stubEnv("SUPABASE_URL","");expect(await findProductBeerArtwork({} as Database,"augustiner-2","Germany")).toBeUndefined();
  vi.stubEnv("SUPABASE_URL","https://example.supabase.co");expect(await findProductBeerArtwork({} as Database,undefined,"Germany")).toBeUndefined();
  expect(await findProductBeerArtwork(dbReturning([]),"augustiner-2","Germany")).toBeUndefined();
  expect(await findProductBeerArtwork(dbReturning([],true),"augustiner-2","Germany")).toBeUndefined();
 });
 it("rejects foreign product/country, unapproved, unpublished and foreign-origin images",async()=>{
  vi.stubEnv("SUPABASE_URL","https://example.supabase.co");
  for(const mutate of [(r:ReturnType<typeof row>)=>r.productId="augustiner-1",(r:ReturnType<typeof row>)=>r.country="Portugal",(r:ReturnType<typeof row>)=>r.asset.approvalStatus="pending",(r:ReturnType<typeof row>)=>r.asset.active=false,(r:ReturnType<typeof row>)=>r.asset.publishedAt=null as unknown as Date,(r:ReturnType<typeof row>)=>r.asset.imageUrl="https://other.example/product.webp"]){const r=row();mutate(r);expect(await findProductBeerArtwork(dbReturning([r]),"augustiner-2","Germany")).toBeUndefined();}
 });
});
