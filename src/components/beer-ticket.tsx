"use client";
/* eslint-disable @next/next/no-img-element -- artwork comes from the reviewed local manifest. */
import { useEffect, useRef, useState } from "react";
import type { DrawResultSnapshot } from "@/domain/result";
import { beerArtworkFor } from "@/domain/beer-artwork";
import type {BeerArtwork} from "@/domain/beer-artwork";
type Brand = NonNullable<NonNullable<DrawResultSnapshot["beerSignals"]>["countryBrand"]>;
export function BeerTicket({brand,resultPath,approvedArtwork}:{brand:Brand;resultPath:string;approvedArtwork?:BeerArtwork}) {
  const [state,setState] = useState<"sealed"|"opening"|"revealed">("sealed");
  const [failed,setFailed] = useState(false);
  const artwork = approvedArtwork ?? beerArtworkFor(brand.countryName,brand.brandName,brand.productId);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const storageKey = "matchbound:beer-ticket:v1:" + resultPath;
  useEffect(()=>{
    try { if(localStorage.getItem(storageKey)===brand.brandName) setState("revealed"); } catch {}
    return ()=>{ if(timer.current) clearTimeout(timer.current); };
  },[storageKey,brand.brandName]);
  const reveal = ()=>{
    if(state!=="sealed") return;
    const finish=()=>{setState("revealed");try{localStorage.setItem(storageKey,brand.brandName);}catch{}};
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){finish();return;}
    setState("opening");timer.current=setTimeout(finish,1500);
  };
  return <section className={"beer-ticket beer-ticket--"+state} aria-label={"A beer from "+brand.countryName} data-beer-state={state}>
    <div className="beer-ticket-inner"><div className="beer-ticket-kicker"><span>{brand.countryName} / Beer draw</span><span>{state==="revealed"?"Picked for you":"Optional"}</span></div>
      {state==="revealed" ? <div className="beer-ticket-result"><div className={"beer-ticket-art"+(artwork?.kind==="product-photo"?" beer-ticket-art--photo":"")}>{artwork&&!failed ? <img src={artwork.src} alt={brand.brandName+(artwork.kind==="product-photo"?" product photo":" logo")} onError={()=>setFailed(true)}/> : <BeerSeal/>}</div><p className="eyebrow">Your weekend beer</p><h2>{brand.brandName}</h2>{brand.originStatement&&<p className="beer-origin">{brand.originStatement}</p>}{(brand.style || brand.abvBasisPoints !== undefined) && <p className="beer-country-note">{[brand.style, brand.abvBasisPoints !== undefined ? `${brand.abvBasisPoints / 100}% ABV` : undefined].filter(Boolean).join(" · ")}</p>}{brand.sourceUrl && <a className="beer-art-credit" href={brand.sourceUrl} target="_blank" rel="noreferrer">Brewery source ↗</a>}<p className="beer-country-note">A beer from {brand.countryName}.</p>{artwork&&<details className="beer-art-credit"><summary>{artwork.kind==="product-photo"?"Photo source":"Logo source"}</summary><a href={artwork.source} target="_blank" rel="noreferrer">{artwork.author} · {artwork.license}</a><a href={artwork.licenseUrl || artwork.source} target="_blank" rel="noreferrer">Reuse information</a>{artwork.note&&<p>{artwork.note}</p>}<p>Brand marks belong to their respective owners.</p></details>}</div> : <div className="beer-ticket-sealed"><BeerSeal/><div><h2>Your beer<br/>is inside.</h2><p>A local beer for your football weekend.</p></div></div>}
    </div>
    <div className="beer-ticket-stub">{state==="revealed" ? <p>One match. One local beer.</p> : <button type="button" className="button" onClick={reveal} disabled={state==="opening"}>{state==="opening"?"Drawing your beer…":"Reveal my beer"}<span aria-hidden="true">→</span></button>}</div>
    <p className="sr-only" role="status" aria-live="polite">{state==="revealed"?"Your beer: "+brand.brandName+".":state==="opening"?"Drawing your beer.":""}</p>
  </section>;
}
function BeerSeal(){return <div className="beer-seal" aria-hidden="true"><span>MATCHBOUND</span><svg width="46" height="54" viewBox="0 0 46 54" fill="none"><path d="M10 17h26l-3 31H13l-3-31ZM10 17c-6-4-2-12 4-10 1-7 12-7 14-1 8-3 13 6 8 11" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="m18 23 1 18m8-18-1 18" stroke="currentColor" strokeWidth="1.5"/></svg><span>BEER DRAW</span></div>}
