import { creativeSubjectKey, type CreativeManifest, type CreativePlacement } from "./creative-library";
export type SourcingVenue = { competitionCode:string;country:string;city:string;stadium:string;providerTeamId:number;verificationUrl?:string;sourceUrl:string };
/** Build exact, deduplicated research tasks. A search link never confers approval. */
export function creativeSourcingQueue(venues: SourcingVenue[], manifest: CreativeManifest, league: string) {
 const rows=venues.filter(v=>v.competitionCode===league);
 if(!rows.length)throw Error("Unknown or empty league inventory");
 const covered=new Set(manifest.assets.filter(a=>a.approvalStatus==="approved").flatMap(a=>a.placements.map(creativeSubjectKey)));
 const tasks=new Map<string,{subject:CreativePlacement;providerTeamIds:number[];verificationUrls:string[];status:"needs-source";searchUrl:string}>();
 for(const row of rows)for(const subjectType of ["city","stadium"] as const){
  const subject:CreativePlacement={subjectType,country:row.country,city:row.city,...(subjectType==="stadium"&&{stadium:row.stadium}),alt:""};
  const key=creativeSubjectKey(subject);if(covered.has(key))continue;
  const task=tasks.get(key)??{subject,providerTeamIds:[],verificationUrls:[],status:"needs-source",searchUrl:"https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search="+encodeURIComponent([row.country,row.city,subjectType==="stadium"?row.stadium:"landmark"].join(" "))};
  if(!task.providerTeamIds.includes(row.providerTeamId))task.providerTeamIds.push(row.providerTeamId);
  const verificationUrl=row.verificationUrl??row.sourceUrl;
  if(!task.verificationUrls.includes(verificationUrl))task.verificationUrls.push(verificationUrl);
  tasks.set(key,task);
 }
 return [...tasks.entries()].map(([subjectKey,task])=>({subjectKey,...task}));
}
