"use client";
/* eslint-disable @next/next/no-img-element -- verified local stadium photo with error fallback. */
import {useState} from "react";
import type {JournalPhoto} from "@/domain/journal-visuals";
export function StadiumBackdrop({photo}:{photo:JournalPhoto}) {
 const [failed,setFailed]=useState(false);
 if(failed)return null;
 return <><div className="fixture-backdrop" aria-hidden="true"><img src={photo.src} alt="" style={{objectPosition:photo.position}} onError={()=>setFailed(true)}/></div><details className="fixture-photo-credit"><summary>Photo credit</summary><div><a href={photo.source} target="_blank" rel="noreferrer">{photo.title}</a><span>{photo.author}</span><a href={photo.licenseUrl||photo.source} target="_blank" rel="noreferrer">{photo.license}</a><span>Responsive crop · no content retouching</span></div></details></>;
}
