import Link from "next/link";
import { notFound } from "next/navigation";
import { createDb } from "@/db/client";
import { findSharedDraw } from "@/db/draw-repository";
import { TripSharing } from "@/components/trip-sharing";
import { ResultReady } from "@/components/result-handoff";
import { CountryFlagMark } from "@/components/visual-identity";
import { FixtureCard } from "@/components/fixture-card";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { formatTripDates, matchupSummary, signedGoalDifference } from "@/domain/matchday";

export default async function MatchPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  const draw = await findSharedDraw(createDb(), shareToken);
  if (!draw) notFound();
  if (draw.expiresAt <= new Date()) return <main className="site-shell"><ResultReady fallback /><SiteHeader /><section className="draw-state"><p className="eyebrow">Matchbound</p><h1>This trip link has expired.</h1><p>Your next football weekend is still out there.</p><Link className="button" href="/">Draw another match <span aria-hidden="true">↗</span></Link></section><SiteFooter /></main>;

  const result = draw.resultSnapshot;
  const summary = matchupSummary(result.headToHead);
  const beerPrice = result.beerSignals?.cityAverage;
  const beerBrand = result.beerSignals?.countryBrand;
  return <main className="site-shell result-page"><ResultReady /><SiteHeader /><div className="result-content">
    <div className="resultlocation"><div><p className="eyebrow result-locked"><span className="dot" aria-hidden="true" />Fixture locked</p><h1 tabIndex={-1} data-handoff-heading>{result.city}</h1><p className="trip-dates">{formatTripDates(draw.tripStartDate, draw.tripEndDate)}</p></div><span className="country"><CountryFlagMark identity={result.visualIdentity} />{result.country}</span></div>
    <div className="result-grid"><FixtureCard result={result} /><div className="result-extras">
      {summary && <section className="matchup" aria-labelledby="matchup-title"><div className="matchuptop"><h2 id="matchup-title">The matchup</h2><span>Last {summary.count} {summary.count === 1 ? "meeting" : "meetings"}</span></div>
        <div className="stats"><div><strong>{summary.homeWins}</strong><span className="stat-label">{result.homeTeam} {summary.homeWins === 1 ? "win" : "wins"}</span><p className="gd"><b>{signedGoalDifference(summary.homeGoalDifference)}</b><span>Goal difference</span></p></div>
          <div><strong>{summary.draws}</strong><span className="stat-label">{summary.draws === 1 ? "Draw" : "Draws"}</span></div>
          <div><strong>{summary.awayWins}</strong><span className="stat-label">{result.awayTeam} {summary.awayWins === 1 ? "win" : "wins"}</span><p className="gd"><b>{signedGoalDifference(summary.awayGoalDifference)}</b><span>Goal difference</span></p></div></div>
      </section>}
      {(beerBrand || beerPrice) && <section className="beer-panel" aria-label="Beer details">
        <h2 className="eyebrow">{beerBrand ? `A beer from ${beerBrand.countryName}` : `Beer in ${result.city}`}</h2>
        {beerBrand && <div className="beer-brand"><p className="beer-name">{beerBrand.brandName}</p>{beerBrand.originStatement && <p className="beer-origin">{beerBrand.originStatement}</p>}</div>}
        {beerPrice && <div className="beer-price"><p className="eyebrow">{new Date(beerPrice.observedAt).getUTCFullYear()} {result.city} average</p><strong>{(beerPrice.averagePriceMinor / 100).toLocaleString("en-GB", { style: "currency", currency: beerPrice.currency })}</strong><p className="beer-serving">{beerPrice.servingLabel}</p><p className="beer-price-note">City average, not a stadium price.</p></div>}
      </section>}
      {result.officialTicketUrl && <div className="draw-actions"><a className="button ticket" href={result.officialTicketUrl} target="_blank" rel="noreferrer">Get tickets<span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>}
      <TripSharing resultPath={`/m/${encodeURIComponent(shareToken)}`} message={`${result.homeTeam} v ${result.awayTeam} — ${result.city}. Our next football weekend.`} />
    </div></div>
  </div><SiteFooter /></main>;
}
