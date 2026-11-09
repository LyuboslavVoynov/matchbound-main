import type { DrawResultSnapshot } from "@/domain/result";
import { matchupSummary } from "@/domain/matchday";
import { TeamCrestPair } from "./visual-identity";

export function MatchupLedger({ result }: { result: DrawResultSnapshot }) {
  const snapshot = result.headToHead;
  const summary = matchupSummary(snapshot);
  const meetings = summary && snapshot ? [...snapshot.meetings].sort((a,b)=>Date.parse(b.kickoffAt)-Date.parse(a.kickoffAt)) : [];
  return <section className="matchup ledger scorecards" aria-labelledby="matchup-title">
    <div className="matchuptop"><h2 id="matchup-title">Matchup</h2>{summary && <span>Last {summary.count} {summary.count === 1 ? "meeting" : "meetings"}</span>}</div>
    {summary && snapshot ? <>
      <div className="ledger-summary"><span><strong>{summary.homeWins}</strong> {result.homeTeam} {summary.homeWins === 1 ? "win" : "wins"}</span><span><strong>{summary.draws}</strong> {summary.draws === 1 ? "draw" : "draws"}</span><span><strong>{summary.awayWins}</strong> {result.awayTeam} {summary.awayWins === 1 ? "win" : "wins"}</span></div>
      <p className="ledger-order">Past results · home team first</p>
      <ol className="ledger-meetings">{meetings.map((meeting, index) => {
        const reversed = meeting.homeTeamId !== snapshot.homeTeamId;
        const identity = result.visualIdentity && {...result.visualIdentity, homeTeamCrestUrl: reversed ? result.visualIdentity.awayTeamCrestUrl : result.visualIdentity.homeTeamCrestUrl, awayTeamCrestUrl: reversed ? result.visualIdentity.homeTeamCrestUrl : result.visualIdentity.awayTeamCrestUrl};
        const validDate = Number.isFinite(Date.parse(meeting.kickoffAt));
        return <li key={meeting.id}><p className="scorecard-index">Meeting {String(index+1).padStart(2,"0")}</p><div className="ledger-meeting-meta">{validDate && <time dateTime={meeting.kickoffAt}>{new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(meeting.kickoffAt))}</time>}<span>{meeting.competition}</span></div><div className="scorecard-face"><TeamCrestPair identity={identity}/><span className="ledger-score" aria-label={meeting.homeTeam + " " + meeting.homeScore + ", " + meeting.awayTeam + " " + meeting.awayScore}>{meeting.homeScore}<span aria-hidden="true">–</span>{meeting.awayScore}</span></div><p className="scorecard-opponents"><span>{meeting.homeTeam}</span><i aria-hidden="true"> / </i><span>{meeting.awayTeam}</span></p></li>;
      })}</ol>
    </> : <p className="ledger-empty">No previous completed meetings are available for this matchup.</p>}
  </section>;
}
