"use client";
/* eslint-disable @next/next/no-img-element -- verified local stadium photo with error fallback. */
import {useEffect,useRef,useState} from "react";
import type {JournalPhoto} from "@/domain/journal-visuals";
export function StadiumBackdrop({photo}:{photo:JournalPhoto}) {
 const [failedSrc,setFailedSrc]=useState<string>();
 const image=useRef<HTMLImageElement>(null);
 useEffect(()=>{
  // An SSR image may fail before React attaches its error handler.
  if(image.current?.complete && image.current.naturalWidth===0)setFailedSrc(photo.src);
 },[photo.src]);
 if(failedSrc===photo.src)return null;
 return <><div className="fixture-backdrop" aria-hidden="true"><img ref={image} src={photo.src} alt="" style={{objectPosition:photo.position}} onError={()=>setFailedSrc(photo.src)}/></div><details className="fixture-photo-credit"><summary>Photo credit</summary><div><a href={photo.source} target="_blank" rel="noreferrer">{photo.title}</a><span>{photo.author}</span><a href={photo.licenseUrl||photo.source} target="_blank" rel="noreferrer">{photo.license}</a><span>Responsive crop · no content retouching</span></div></details></>;
}
