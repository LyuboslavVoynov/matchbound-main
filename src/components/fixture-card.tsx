import type { DrawResultSnapshot } from "@/domain/result";
import { CompetitionEmblemMark, FixtureTeams } from "./visual-identity";

export function FixtureCard({ result }: Readonly<{ result: DrawResultSnapshot }>) {
  const kickoff = new Date(result.kickoffAt);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: result.timezone }).format(kickoff);
  const zone = new Intl.DateTimeFormat("en-GB", { timeZone: result.timezone, timeZoneName: "short" }).formatToParts(kickoff).find(part => part.type === "timeZoneName")?.value;
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: result.timezone }).format(kickoff);
  const fullDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: result.timezone }).format(kickoff);
  return <article className="fixture match-card" aria-label={`${result.homeTeam} versus ${result.awayTeam}`}>
    <div className="competition"><CompetitionEmblemMark identity={result.visualIdentity} /><span>{result.competition}</span><span className="competition-country">{result.country}</span></div>
    <div className="fixturebody"><h2 className="fixture-heading sr-only">{result.homeTeam} v {result.awayTeam}</h2><FixtureTeams identity={result.visualIdentity} homeTeam={result.homeTeam} awayTeam={result.awayTeam}>
      <div className="kickoff"><time dateTime={result.kickoffAt} aria-label={`${fullDate}, ${time} ${zone}`}><strong>{time}</strong><small>{date} · {zone}</small></time><span className="vs" aria-hidden="true">VS</span></div>
    </FixtureTeams></div>
    <div className="fixturefoot venue"><div><p>At the ground</p><strong>{result.stadium}</strong></div><span>{result.city}, {result.country}</span></div>
  </article>;
}
