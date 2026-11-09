"use client";
/* eslint-disable @next/next/no-img-element -- curated local photography with explicit load/error fallback. */
import { useEffect, useState } from "react";
import type { JournalPhoto } from "@/domain/journal-visuals";

/** Bounded preload freezes the usable set before playback; slow photos stay on the editorial fallback. */
export function useJournalPreload(photos: ReturnType<typeof import("@/domain/journal-visuals").journalVisuals>) {
  const key = [photos.country?.src, photos.city?.src, photos.stadium?.src].filter(Boolean).join("|");
  const [state, setState] = useState<{ key: string; ready: boolean; loaded: string[] }>({ key: "", ready: false, loaded: [] });
  useEffect(() => {
    let active = true;
    let settled = false;
    const loaded: string[] = [];
    const sources = key ? key.split("|") : [];
    let remaining = sources.length;
    const finish = () => { if (!active || settled) return; settled = true; setState({ key, ready: true, loaded: [...loaded] }); };
    const timer = window.setTimeout(finish, 1400);
    const images = sources.map(src => {
      const image = new Image();
      let completed = false;
      const complete = (ok: boolean) => {
        if (completed || !active || settled) return;
        completed = true;
        if (ok) loaded.push(src);
        if (--remaining === 0) finish();
      };
      image.onload = () => { void image.decode().then(() => complete(true), () => complete(false)); };
      image.onerror = () => complete(false);
      image.src = src;
      return image;
    });
    if (!sources.length) finish();
    return () => { active = false; window.clearTimeout(timer); images.forEach(image => { image.onload = null; image.onerror = null; }); };
  }, [key]);
  return { ready: state.key === key && state.ready, loaded: state.key === key ? state.loaded : [] };
}

export function JournalArtwork({ photo, usable, children, onCreditToggle }: { photo?: JournalPhoto; usable: boolean; children: React.ReactNode; onCreditToggle?: (open: boolean) => void }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!photo || !usable || failedSrc === photo.src) return <div className="journal-live-art journal-editorial">{children}</div>;
  return <figure className="journal-live-art journal-live-photo"><img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.position }} onError={() => setFailedSrc(photo.src)} /><figcaption><span>{photo.alt}</span><details onToggle={event => { onCreditToggle?.(event.currentTarget.open); }}><summary>Photo credit</summary><div><a href={photo.source} target="_blank" rel="noreferrer">{photo.title}</a><span>{photo.author}</span><a href={photo.licenseUrl || photo.source} target="_blank" rel="noreferrer">{photo.license}</a><span>Responsive crop · no retouching</span><span>Close credit to continue the reveal.</span></div></details></figcaption></figure>;
}
