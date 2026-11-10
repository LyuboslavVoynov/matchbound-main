import {readFile,writeFile} from "node:fs/promises";
import {creativeSourcingQueue,type SourcingVenue} from "../src/domain/creative-sourcing";
import {validateCreativeManifest,type CreativeManifest} from "../src/domain/creative-library";
async function main(){
 const args=process.argv.slice(2);if(args.some(a=>!a.startsWith("--league=")&&!a.startsWith("--output=")))throw Error("Unknown option");
 const league=args.find(a=>a.startsWith("--league="))?.slice(9);if(!league)throw Error("Use --league=DED");
 const venues=JSON.parse(await readFile("data/creatives/venue-inventory.json","utf8")) as SourcingVenue[];
 const manifest=JSON.parse(await readFile("data/creatives/manifest.json","utf8")) as CreativeManifest;
 const issues=validateCreativeManifest(manifest);if(issues.length)throw Error(issues.join("\n"));
 const tasks=creativeSourcingQueue(venues,manifest,league);const output=JSON.stringify({league,status:"research-only",tasks},null,2)+"\n";
 const path=args.find(a=>a.startsWith("--output="))?.slice(9);if(path)await writeFile(path,output);else process.stdout.write(output);
}
main().catch(e=>{console.error(e instanceof Error?e.message:"Queue failed");process.exitCode=1});
