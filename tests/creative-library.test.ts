import { describe,it,expect } from "vitest";
import manifest from "../data/creatives/manifest.json";
import { approvedCreativeUrl,creativeObjectKey,creativePublicUrl,creativeSubjectKey,reusableCreativeLicense,validateCreativeManifest,type CreativeManifest } from "@/domain/creative-library";
const valid=manifest as CreativeManifest;
describe("curated creative publication gates",()=>{
 it("permits unplaced assets only in explicit asset-only mode while retaining licence gates",()=>{
  const m=structuredClone(valid);m.assets[0].placements=[];
  expect(validateCreativeManifest(m).join()).toContain("at least one placement");
  expect(validateCreativeManifest(m,{allowUnplacedAssets:true})).toEqual([]);
  m.assets[0].licenseName="CC BY-NC 4.0";
  expect(validateCreativeManifest(m,{allowUnplacedAssets:true}).join()).toContain("reusable licence");
 });
 it("validates reviewed sources and every exact placement in the local collection",()=>{expect(validateCreativeManifest(valid)).toEqual([])});
 it("normalizes accents without borrowing another stadium or country",()=>{
  const venue={subjectType:"stadium" as const,country:"Spain",city:"Bilbao",stadium:"San Mamés"};
  expect(creativeSubjectKey(venue)).toBe(creativeSubjectKey({...venue,stadium:"San Mames"}));
  expect(creativeSubjectKey(venue)).not.toBe(creativeSubjectKey({...venue,stadium:"San Mamés training ground"}));
  expect(creativeSubjectKey(venue)).not.toBe(creativeSubjectKey({...venue,country:"Portugal"}));
 });
 it("rejects unreviewed approvals and duplicate approved placements",()=>{
  const a=structuredClone(valid);delete a.assets[0].reviewedAt;expect(validateCreativeManifest(a).join()).toContain("approval requires");
  const b=structuredClone(valid);b.assets[1].placements=[b.assets[0].placements[0]];expect(validateCreativeManifest(b).join()).toContain("multiple approved");
 });
 it("refuses NC/ND licences and licence-name/link mismatches",()=>{
  expect(reusableCreativeLicense("CC BY-NC 4.0","https://creativecommons.org/licenses/by-nc/4.0/")).toBe(false);
  expect(reusableCreativeLicense("CC BY-SA 4.0","https://creativecommons.org/licenses/by/4.0/")).toBe(false);
  expect(reusableCreativeLicense("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/")).toBe(true);
 });
 it("rejects invalid crop points, escaping paths and source credentials",()=>{
  const a=structuredClone(valid);a.assets[0].focalX=101;a.assets[0].localPath="../outside.webp";a.assets[0].sourcePageUrl="https://user:secret@commons.wikimedia.org/file";
  const errors=validateCreativeManifest(a).join();expect(errors).toContain("focal point");expect(errors).toContain("relative WebP");expect(errors).toContain("HTTPS source");
 });
 it("publishes immutable hashed keys only on the configured public bucket origin",()=>{
  const key=creativeObjectKey(valid.assets[0]);const url=creativePublicUrl("https://example.supabase.co","matchbound-creatives",key);
  expect(approvedCreativeUrl(url,"https://example.supabase.co","matchbound-creatives")).toBe(url);
  for(const bad of [url.replace("example.supabase.co","other.example"),url+"?token=secret",url.replace("/public/","/sign/"),url.replace("matchbound-creatives","private")])expect(approvedCreativeUrl(bad,"https://example.supabase.co","matchbound-creatives")).toBeUndefined();
 });
});
