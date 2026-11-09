/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import assets from "@/data/journal-assets.json";
import "./journal.css";

const stages = ["Country", "City", "League", "Stadium", "Clubs"];
const trips = [
  { id: "porto", country: "Portugal", countryAsset: "portugal-country", city: "Porto", landmark: "Dom Luís I Bridge", league: "Primeira Liga", stadium: "Estádio do Dragão", home: "FC Porto", away: "Benfica", crests: [503,1903], caption: "Over the river. Into the stands.", code: "PT" },
  { id: "milan", country: "Italy", countryAsset: "italy-country", city: "Milan", landmark: "Duomo di Milano", league: "Serie A", stadium: "San Siro", home: "AC Milan", away: "Inter", crests: [98,108], caption: "A city of icons. A ground like no other.", code: "IT" },
  { id: "bilbao", country: "Spain", countryAsset: "spain-country", city: "Bilbao", landmark: "Guggenheim Museum", league: "La Liga", stadium: "San Mamés", home: "Athletic Club", away: "Real Sociedad", crests: [77,92], caption: "From the riverbank to the roar.", code: "ES" },
];
type AssetKey = keyof typeof assets;
function Photograph({ asset, alt, priority = false }: { asset: string; alt: string; priority?: boolean }) {
  const photo = assets[asset as AssetKey];
  return <figure className="journal-photo"><img src={photo.src} alt={alt} loading={priority ? "eager" : "lazy"} /><figcaption><span>{alt}</span><a href={photo.source} target="_blank" rel="noreferrer">Photo credit ↗</a></figcaption></figure>;
}
export default function JournalPreview() {
  return <main className="journal-preview">
    <header className="journal-header"><Link href="/">MATCHBOUND<span>↗</span></Link><span>DESIGN STUDY / WEEKEND JOURNAL</span></header>
    <section className="journal-intro"><p className="journal-eyebrow">A little anticipation. A whole new story.</p><h1>Your weekend,<br/><em>chapter by chapter.</em></h1><div><p>Real places. Real photography. Five moments that take you from a country to the clubs.</p><p className="journal-study-note">Static storyboard · illustrative matchups, not scheduled fixtures</p></div></section>
    <nav className="journal-index" aria-label="Sample destinations">{trips.map(t=><a key={t.id} href={`#${t.id}`}>{t.city}<span>↘</span></a>)}<Link href="/design/weekend-journal/play?destination=fallback">Try fallback<span>↗</span></Link><a href="#credits">Image sources<span>↗</span></a></nav>
    {trips.map((trip, tripIndex)=><section className="journal-destination" id={trip.id} key={trip.id}>
      <div className="journal-section-heading"><div><p className="journal-eyebrow">EDITION {String(tripIndex+1).padStart(2,"0")} / {trip.country}</p><h2>{trip.city}<span>.</span></h2></div><div><p>{trip.caption}</p><Link href={`/design/weekend-journal/play?destination=${trip.id}`}>Play this reveal →</Link></div></div>
      <div className="journal-storyboard">{stages.map((stage,i)=>{
        const title=[trip.country,trip.city,trip.league,trip.stadium,`${trip.home} / ${trip.away}`][i];
        return <article className={`journal-card journal-stage-${i}`} key={stage} aria-label={`${stage}: ${title}`}>
          <div className="journal-card-mark">MATCHBOUND<span>↗</span></div>
          <div className="journal-progress" aria-label={`Step ${i+1} of 5`}>{stages.map((s,j)=><span key={s} className={j<=i?"is-revealed":""}><i/>{s}</span>)}</div>
          <div className="journal-chapter"><span>CHAPTER {String(i+1).padStart(2,"0")}</span><span>0{i+1} / 05</span></div>
          <h3>{i===4?<><span>{trip.home}</span><small>versus</small><span>{trip.away}</span></>:title}</h3><p className="journal-stage-label">{["The destination","The city","The competition","The ground","Your match"][i]}</p>
          {i===0&&<Photograph asset={trip.countryAsset} alt={trip.country==="Italy"?"Tuscany, Italy":trip.country==="Spain"?"Gaztelugatxe, Basque coast":"Algarve coast, Portugal"} priority={tripIndex===0}/>}
          {i===1&&<Photograph asset={`${trip.id}-city`} alt={trip.landmark} priority={tripIndex===0}/>}
          {i===2&&<div className="journal-league-art"><span>{trip.code} / FOOTBALL</span><img className="journal-board-emblem" src={`https://crests.football-data.org/${({porto:"PPL",milan:"SA",bilbao:"PD"} as Record<string,string>)[trip.id]}.png`} alt={`${trip.league} emblem`} loading="lazy"/><strong>{trip.league}</strong><span>THE WEEKEND HAS A STAGE.</span></div>}
          {i===3&&<Photograph asset={`${trip.id}-stadium`} alt={trip.stadium}/>}
          {i===4&&<div className="journal-club-art"><div>{trip.crests.map((id,j)=><img key={id} src={`https://crests.football-data.org/${id}.png`} alt={`${j===0?trip.home:trip.away} crest`} loading="lazy"/>)}</div><p>One match.<br/><em>A new story.</em></p><span>{trip.stadium} / {trip.city}</span></div>}
          
        </article>;
      })}</div>
    </section>)}
    <section className="journal-credits" id="credits"><p className="journal-eyebrow">THE PICTURES BEHIND THE STORY</p><h2>Real photography.<br/><em>Considered sources.</em></h2><p>Photographs are locally stored for this design study. Responsive crops are used; colour and image content are unaltered. Country imagery sets a national mood and does not represent the destination city. League panels use provider-hosted competition emblems. Club crests are served from the existing football-data image host.</p><div>{Object.entries(assets).map(([id,a])=><article key={id}><a href={a.source} target="_blank" rel="noreferrer">{a.title} ↗</a><p>{a.author}</p><a href={a.licenseUrl||a.source} target="_blank" rel="noreferrer">{a.license}</a><span> · cropped for layout</span></article>)}</div></section>
    <footer className="journal-bottom">MATCHBOUND / WEEKEND JOURNAL <span>Photography study · November 2026</span></footer>
  </main>;
}
