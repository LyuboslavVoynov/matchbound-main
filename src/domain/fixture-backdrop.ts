import extra from "@/data/fixture-backdrops.json";
import {journalVisuals,type JournalPhoto} from "./journal-visuals";
import type {DrawResultSnapshot} from "./result";
export function fixtureBackdropFor(result:Pick<DrawResultSnapshot,"country"|"city"|"stadium">):JournalPhoto|undefined {
 if(result.country==="Germany"&&result.city==="Munich"&&result.stadium==="Allianz Arena")return {...extra["allianz-arena"],alt:"Allianz Arena, Munich",position:"center 50%"};
 return journalVisuals(result).stadium;
}
