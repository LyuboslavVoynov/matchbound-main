import type { JournalPhoto } from "@/domain/journal-visuals";
import type {BeerArtwork} from "@/domain/beer-artwork";
import type { DrawResultSnapshot } from "@/domain/result";
import { fixtureBackdropFor } from "@/domain/fixture-backdrop";
import { MatchupLedger } from "./matchup-ledger";
import { BeerTicket } from "./beer-ticket";
import { TripSharing } from "./trip-sharing";
import { ResultReady } from "./result-handoff";
import { CountryFlagMark } from "./visual-identity";
import { FixtureCard } from "./fixture-card";
import { SiteFooter, SiteHeader } from "./site-chrome";
import { formatTripDates } from "@/domain/matchday";
export function MatchResult({result,tripStartDate,tripEndDate,resultPath,preview=false,backdrop,beerArtwork}:{result:DrawResultSnapshot;tripStartDate:string;tripEndDate:string;resultPath:string;preview?:boolean;backdrop?:JournalPhoto;beerArtwork?:BeerArtwork}) {
  const beerPrice = result.beerSignals?.cityAverage;
  const beerBrand = result.beerSignals?.countryBrand;
  return <main className="site-shell result-page"><ResultReady /><SiteHeader /><div className="result-content">{preview&&<p className="result-preview-note">Design preview · recorded match results, illustrative trip dates</p>}
    <div className="resultlocation"><div><p className="eyebrow result-locked"><span className="dot" aria-hidden="true" />Fixture locked</p><h1 tabIndex={-1} data-handoff-heading>{result.city}</h1><p className="trip-dates">{formatTripDates(tripStartDate, tripEndDate)}</p></div><span className="country"><CountryFlagMark identity={result.visualIdentity} />{result.country}</span></div>
    <div className="result-grid ledger-result-grid"><FixtureCard result={result} backdrop={backdrop ?? fixtureBackdropFor(result)}/><div className={"result-extras ledger-result-extras" + (!beerBrand && !beerPrice ? " ledger-full-width" : "")}>
      <MatchupLedger result={result}/>
      <div className="ledger-side">
      {beerBrand && <BeerTicket key={resultPath+":"+beerBrand.brandName} brand={beerBrand} resultPath={resultPath} approvedArtwork={beerArtwork}/>}
      {beerPrice && <section className="beer-panel beer-price-only" aria-label={`Beer prices in ${result.city}`}><h2 className="eyebrow">Beer in {result.city}</h2><div className="beer-price"><p className="eyebrow">{new Date(beerPrice.observedAt).getUTCFullYear()} {result.city} average</p><strong>{(beerPrice.averagePriceMinor / 100).toLocaleString("en-GB", { style: "currency", currency: beerPrice.currency })}</strong><p className="beer-serving">{beerPrice.servingLabel}</p><p className="beer-price-note">City average, not a stadium price.</p></div></section>}
      </div></div><div className="ledger-result-actions">
      {result.officialTicketUrl && <div className="draw-actions"><a className="button ticket" href={result.officialTicketUrl} target="_blank" rel="noreferrer">Get tickets<span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>}
      <TripSharing labelled resultPath={resultPath} message={`${result.homeTeam} v ${result.awayTeam} — ${result.city}. Our next football weekend.`} />
    </div></div>
  </div><SiteFooter /></main>;
}
