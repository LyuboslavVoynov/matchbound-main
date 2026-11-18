"use client";
/* eslint-disable @next/next/no-img-element -- artwork comes from the reviewed local manifest. */
import { useEffect, useRef, useState } from "react";
import type { DrawResultSnapshot } from "@/domain/result";
import { beerArtworkFor } from "@/domain/beer-artwork";
import "./beer-first-pour.css";
import { ExternalLinkIcon } from "./external-link-icon";
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
    setState("opening");timer.current=setTimeout(finish,2500);
  };
  return <section className={"beer-ticket beer-ticket--"+state} aria-label={"A beer from "+brand.countryName} data-beer-state={state}>
    <div className="beer-ticket-inner"><div className="beer-ticket-kicker"><span>{brand.countryName} / Beer draw</span><span>{state==="revealed"?"Picked for you":"Optional"}</span></div>
      {state==="revealed" ? <div className="beer-ticket-result"><div className={"beer-ticket-art"+(artwork?.kind==="product-photo"?" beer-ticket-art--photo":"")}>{artwork&&!failed ? <img src={artwork.src} alt={brand.brandName+(artwork.kind==="product-photo"?" product photo":" logo")} onError={()=>setFailed(true)}/> : <BeerSeal/>}</div><p className="eyebrow">Your weekend beer</p><h2>{brand.brandName}</h2>{brand.originStatement&&<p className="beer-origin">{brand.originStatement}</p>}{(brand.style || brand.abvBasisPoints !== undefined) && <p className="beer-country-note">{[brand.style, brand.abvBasisPoints !== undefined ? `${brand.abvBasisPoints / 100}% ABV` : undefined].filter(Boolean).join(" · ")}</p>}{brand.sourceUrl && <a className="beer-art-credit beer-source-link" href={brand.sourceUrl} target="_blank" rel="noreferrer">Brewery source <ExternalLinkIcon/></a>}<p className="beer-country-note">A beer from {brand.countryName}.</p>{artwork&&<details className="beer-art-credit"><summary>{artwork.kind==="product-photo"?"Photo source":"Logo source"}</summary><a href={artwork.source} target="_blank" rel="noreferrer">{artwork.author} · {artwork.license}</a><a href={artwork.licenseUrl || artwork.source} target="_blank" rel="noreferrer">Reuse information</a>{artwork.note&&<p>{artwork.note}</p>}<p>Brand marks belong to their respective owners.</p></details>}</div> : <div className="beer-ticket-sealed"><BeerGlass/><div><h2>The match is a surprise.<br/>Your first local beer should be too.</h2><p>Reveal a randomly picked beer from your destination country.</p></div></div>}
    </div>
    <div className="beer-ticket-stub">{state==="revealed" ? <p>One match. One local beer.</p> : <button type="button" className="button" onClick={reveal} disabled={state==="opening"}>{state==="opening"?"Pouring your pick…":"Pour my pick"}<span aria-hidden="true">→</span></button>}</div>
    <p className="sr-only" role="status" aria-live="polite">{state==="revealed"?"Your beer: "+brand.brandName+".":state==="opening"?"Pouring your pick.":""}</p>
  </section>;
}
function BeerGlass(){return <div className="beer-pour-art" aria-hidden="true"><span className="beer-pour-halo"/><div className="beer-pour-glass"><div className="beer-pour-liquid"><span className="beer-pour-foam"/></div><span className="beer-pour-shine"/></div></div>;}
function BeerSeal(){return <div className="beer-seal beer-first-pour-seal" aria-hidden="true"><BeerGlass/></div>;}
