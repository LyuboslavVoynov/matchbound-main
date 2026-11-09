import { RevealExperience } from "@/app/m/[shareToken]/reveal/reveal-experience";
import type { DrawResultSnapshot } from "@/domain/result";
const samples: Record<string, Pick<DrawResultSnapshot,"country"|"city"|"competition"|"stadium"|"homeTeam"|"awayTeam"> & { ids: number[]; leagueCode?: string }> = {
  porto: { country:"Portugal",city:"Porto",competition:"Primeira Liga",stadium:"Estádio do Dragão",homeTeam:"FC Porto",awayTeam:"Benfica", ids:[503,1903], leagueCode:"PPL" },
  milan: { country:"Italy",city:"Milan",competition:"Serie A",stadium:"San Siro",homeTeam:"AC Milan",awayTeam:"Inter",ids:[98,108], leagueCode:"SA" },
  bilbao: { country:"Spain",city:"Bilbao",competition:"La Liga",stadium:"San Mamés",homeTeam:"Athletic Club",awayTeam:"Real Sociedad",ids:[77,92], leagueCode:"PD" },
  fallback: { country:"Netherlands",city:"Amsterdam",competition:"Eredivisie",stadium:"Johan Cruijff ArenA",homeTeam:"Ajax",awayTeam:"PSV",ids:[] },
};
export default async function JournalPlayback({ searchParams }: { searchParams: Promise<{destination?:string}> }) {
  const { destination="porto" } = await searchParams;
  const s=samples[destination]??samples.porto;
  const result: DrawResultSnapshot={...s,kickoffDate:"2026-11-28",kickoffAt:"2026-11-28T18:00:00Z",timezone:"Europe/Lisbon",officialTicketUrl:null,visualIdentity:s.ids.length?{competitionEmblemUrl:`https://crests.football-data.org/${s.leagueCode}.png`,homeTeamCrestUrl:`https://crests.football-data.org/${s.ids[0]}.png`,awayTeamCrestUrl:`https://crests.football-data.org/${s.ids[1]}.png`}:undefined};
  return <RevealExperience result={result} resultHref="/design/weekend-journal/complete" preview/>;
}
