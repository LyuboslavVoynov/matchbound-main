import {describe,it,expect} from "vitest";
import venues from "../data/creatives/venue-inventory.json";
import manifest from "../data/creatives/manifest.json";
import {creativeSourcingQueue} from "@/domain/creative-sourcing";
import type {CreativeManifest} from "@/domain/creative-library";
describe("exact image sourcing queue",()=>{
 it("deduplicates Rotterdam city without merging its three grounds",()=>{
  const q=creativeSourcingQueue(venues,{version:1,assets:[]},"DED");expect(q).toHaveLength(34);
  const city=q.filter(t=>t.subject.city==="Rotterdam"&&t.subject.subjectType==="city");expect(city).toHaveLength(1);expect(city[0].providerTeamIds).toHaveLength(3);
  expect(q.filter(t=>t.subject.city==="Rotterdam"&&t.subject.subjectType==="stadium")).toHaveLength(3);
  expect(q.every(t=>t.status==="needs-source")).toBe(true);
 });
 it("excludes already approved exact subjects and rejects unknown leagues",()=>{
  const q=creativeSourcingQueue(venues,manifest as CreativeManifest,"PPL");expect(q).toHaveLength(2);expect(q.every(t=>t.subject.subjectType==="stadium")).toBe(true);
  expect(()=>creativeSourcingQueue(venues,manifest as CreativeManifest,"UNKNOWN")).toThrow();
 });
});
