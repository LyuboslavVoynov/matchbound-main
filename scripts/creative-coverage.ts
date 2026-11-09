import { readFile } from "node:fs/promises";
import { creativeSubjectKey, validateCreativeManifest, type CreativeManifest } from "../src/domain/creative-library";

type Venue = { competitionCode:string; country:string; city:string; stadium:string; providerTeamId:number };
async function main() {
  const manifest=JSON.parse(await readFile("data/creatives/manifest.json","utf8")) as CreativeManifest;
  const venues=JSON.parse(await readFile("data/creatives/venue-inventory.json","utf8")) as Venue[];
  const issues=validateCreativeManifest(manifest);if(issues.length)throw Error(issues.join("\n"));
  const covered=new Set(manifest.assets.filter(a=>a.approvalStatus==="approved").flatMap(a=>a.placements.map(creativeSubjectKey)));
  const subjects=(rows:Venue[],subjectType:"city"|"stadium")=>[...new Map(rows.map(v=>{const p={subjectType,country:v.country,city:v.city,stadium:subjectType==="stadium"?v.stadium:undefined,alt:""};return [creativeSubjectKey(p),p]})).entries()];
  const leagues=[...new Set(venues.map(v=>v.competitionCode))].map(code=>{
    const rows=venues.filter(v=>v.competitionCode===code),cities=subjects(rows,"city"),stadiums=subjects(rows,"stadium");
    return {code,clubs:rows.length,cities:cities.length,approvedCities:cities.filter(([key])=>covered.has(key)).length,stadiums:stadiums.length,approvedStadiums:stadiums.filter(([key])=>covered.has(key)).length,missing:[...cities,...stadiums].filter(([key])=>!covered.has(key)).map(([,p])=>p)};
  });
  console.log(JSON.stringify({inventorySnapshot:"2026-11-08; reviewed season-2026 registry including expansion branch",publicationStatus:"not-checked; this report measures local approved coverage only",approvedLocalAssets:manifest.assets.filter(a=>a.approvalStatus==="approved").length,uniqueCities:subjects(venues,"city").length,uniqueStadiums:subjects(venues,"stadium").length,leagues},null,2));
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Coverage failed.");process.exitCode=1});
