import Link from "next/link";
import { notFound } from "next/navigation";
import { createDb } from "@/db/client";
import { findSharedDraw } from "@/db/draw-repository";
import { CopyLink } from "./copy-link";
import { CompetitionEmblemMark, CountryFlagMark, TeamCrestPair } from "@/components/visual-identity";

export default async function MatchPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  const draw = await findSharedDraw(createDb(), shareToken);
  if (!draw) notFound();

  const result = draw.resultSnapshot;
  if (draw.expiresAt <= new Date()) {
    return <main className="draw-state"><p className="kicker">Matchbound</p><h1>This trip link<br /><i>has expired.</i></h1><Link href="/">Draw another match ↗</Link></main>;
  }

  const date = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${result.kickoffDate}T00:00:00Z`));
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: result.timezone, timeZoneName: "short" }).format(new Date(result.kickoffAt));
  const beerPrice = result.beerSignals?.cityAverage;
  const beerBrand = result.beerSignals?.countryBrand;

  return <main className="draw-page result-artefact"><header className="topbar"><Link className="wordmark" href="/">MATCHBOUND<span>•</span></Link><p>Trip fixture</p></header><section className="match-card"><p className="artefact-stamp">MATCHBOUND / {new Date(`${result.kickoffDate}T00:00:00Z`).getUTCFullYear()}</p><p className="artefact-place">{result.city.toUpperCase()}<br /><span className="identity-country"><CountryFlagMark identity={result.visualIdentity} />{result.country.toUpperCase()}</span></p><div className="artefact-divider" /><p className="match-date">{date} <b>·</b> {time}</p><TeamCrestPair identity={result.visualIdentity} /><h1><span>{result.homeTeam}</span><i>v</i><span>{result.awayTeam}</span></h1><div className="venue"><p>At the ground</p><strong>{result.stadium}</strong><span className="identity-competition"><CompetitionEmblemMark identity={result.visualIdentity} /><span className="identity-competition-text">{result.competition} · {result.city}, {result.country}</span></span></div>{(beerPrice || beerBrand) && <div className="beer-signals" aria-label="Local beer details">{beerPrice && <div><p>{new Date(beerPrice.observedAt).getUTCFullYear()} {result.city} average</p><strong>{beerPrice.servingLabel} · {(beerPrice.averagePriceMinor / 100).toLocaleString("en-GB", { style: "currency", currency: beerPrice.currency })}</strong></div>}{beerBrand && <div className="beer-brand"><p>🍺 Local beer label 🍺</p><strong>{beerBrand.brandName}</strong>{beerBrand.originStatement && <span>{beerBrand.originStatement}</span>}</div>}</div>}<div className="draw-actions">{result.officialTicketUrl && <a className="ticket" href={result.officialTicketUrl} target="_blank" rel="noreferrer">Get tickets <span>↗</span></a>}<CopyLink /></div></section><footer><span>A Matchbound trip</span><span>Fixture locked</span></footer></main>;
}
