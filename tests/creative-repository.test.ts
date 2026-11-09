import { afterEach, describe, expect, it, vi } from "vitest";
import { findJournalVisuals } from "@/db/creative-repository";
import { creativeObjectKey, creativePublicUrl, creativeSubjectKey, type CreativeManifestAsset } from "@/domain/creative-library";
import type { Database } from "@/db/client";
import manifest from "../data/creatives/manifest.json";
const result={country:"Portugal",city:"Porto",stadium:"Estádio do Dragão"};
const a=manifest.assets[0] as CreativeManifestAsset;
const row=()=>({asset:{...a,creator:a.creator,licenseName:a.licenseName,licenseUrl:a.licenseUrl,sourcePageUrl:a.sourcePageUrl,originalUrl:a.originalUrl,transformationNote:a.transformationNote,imageUrl:creativePublicUrl("https://example.supabase.co","matchbound-creatives",creativeObjectKey(a)),active:true,publishedAt:new Date(),reviewedAt:new Date()},placement:{...a.placements[0],subjectKey:creativeSubjectKey(a.placements[0]),active:true}});
function dbReturning(value:unknown){const chain={from:()=>chain,innerJoin:()=>chain,where:async()=>value};return {select:()=>chain}as unknown as Database;}
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();});
describe("approved remote creative resolution",()=>{
 it("keeps the existing local library when Storage is not configured",async()=>{
  vi.stubEnv("SUPABASE_URL","");const db={select:()=>{throw Error("Should not query")}}as unknown as Database;
  const warn=vi.spyOn(console,"warn").mockImplementation(()=>{});
  expect((await findJournalVisuals(db,result)).city?.src).toBe("/journal/porto-city.webp");
  expect(warn).toHaveBeenCalledWith("Creative library configuration issue",{reason:"SUPABASE_URL missing"});
 });
 it("reports a bucket mismatch without logging stored URLs or configuration values",async()=>{
  vi.stubEnv("SUPABASE_URL","https://example.supabase.co");vi.stubEnv("SUPABASE_CREATIVE_BUCKET","matchboundimage");
  const warn=vi.spyOn(console,"warn").mockImplementation(()=>{});
  expect((await findJournalVisuals(dbReturning([row()]),result)).city?.src).toBe("/journal/porto-city.webp");
  expect(warn).toHaveBeenCalledWith("Creative library configuration issue",{reason:"Published image URL does not match configured origin or bucket"});
  expect(JSON.stringify(warn.mock.calls)).not.toContain("https://");
 });
 it("resolves an approved hash-addressed remote image and keeps other local fallbacks",async()=>{
  vi.stubEnv("SUPABASE_URL","https://example.supabase.co");const x=row();const photos=await findJournalVisuals(dbReturning([x]),result);
  expect(photos.city?.src).toBe(x.asset.imageUrl);expect(photos.stadium?.src).toBe("/journal/porto-stadium.webp");
 });
 it("keeps a valid saved trip usable when the optional creative query rejects",async()=>{
  vi.stubEnv("SUPABASE_URL","https://example.supabase.co");
  const warn=vi.spyOn(console,"warn").mockImplementation(()=>{});
  const chain={from:()=>chain,innerJoin:()=>chain,where:async()=>{throw Object.assign(Error("Artwork query failed"),{code:"42501"});}};
  const db={select:()=>chain} as unknown as Database;
  const photos=await findJournalVisuals(db,result);
  expect(photos.city?.src).toBe("/journal/porto-city.webp");expect(photos.stadium?.src).toBe("/journal/porto-stadium.webp");
  expect(warn).toHaveBeenCalledWith(expect.any(String),{code:"42501"});
 });
 it("never renders pending, inactive, unpublished, foreign-origin or mismapped records",async()=>{
  vi.stubEnv("SUPABASE_URL","https://example.supabase.co");
  for(const mutate of [(x:ReturnType<typeof row>)=>x.asset.approvalStatus="pending",(x:ReturnType<typeof row>)=>x.asset.active=false,(x:ReturnType<typeof row>)=>{x.asset.publishedAt=null as unknown as Date},(x:ReturnType<typeof row>)=>x.asset.imageUrl="https://other.example/photo.webp",(x:ReturnType<typeof row>)=>x.placement.subjectKey=creativeSubjectKey({subjectType:"city",country:"Spain",city:"Porto"})]){
   const x=row();mutate(x);expect((await findJournalVisuals(dbReturning([x]),result)).city?.src).toBe("/journal/porto-city.webp");
  }
 });
});
