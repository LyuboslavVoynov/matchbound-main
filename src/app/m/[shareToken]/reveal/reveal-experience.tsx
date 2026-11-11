"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DrawResultSnapshot } from "@/domain/result";
import { journalVisuals, type JournalVisualSet } from "@/domain/journal-visuals";
import { CompetitionEmblemMark, CountryFlagMark, FixtureTeams, useVisualIdentityReadiness } from "@/components/visual-identity";
import { useResultHandoff } from "@/components/result-handoff";
import { JournalArtwork, useJournalPreload } from "@/components/journal-artwork";
import { BrandLockup } from "@/components/brand-lockup";
import Link from "next/link";
import "./journal-reveal.css";

const stages = ["brand-intro", "country", "city", "competition", "stadium", "clubs", "brand-outro"] as const;
const labels = ["Country", "City", "League", "Stadium", "Clubs"];
const holds = [1800, 3700, 4000, 3500, 4100, 4700, 1500];
type RevealExperienceProps = Readonly<{ result: DrawResultSnapshot; resultHref: string; preview?: boolean; photos?: JournalVisualSet }>;
export function RevealExperience({ result, resultHref, preview = false, photos: approvedPhotos }: RevealExperienceProps) {
  const router = useRouter();
  const { cover, cancel } = useResultHandoff();
  const navigationTarget = useRef<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [stage, setStage] = useState(0);
  const [creditOpen, setCreditOpen] = useState(false);
  const [remainingMs, setRemainingMs] = useState(holds[0]);
  const countdown = useRef({ stage: 0, remaining: holds[0] });
  const [hidden, setHidden] = useState(false);
  const [leavingIntro, setLeavingIntro] = useState(false);
  const photos = useMemo(() => approvedPhotos ?? journalVisuals(result), [approvedPhotos, result]);
  const preload = useJournalPreload(photos);
  useVisualIdentityReadiness(result.visualIdentity);
  const navigate = useCallback(() => {
    if (navigationTarget.current === resultHref) return;
    navigationTarget.current = resultHref;
    if (!reducedMotion) cover(resultHref);
    try { router.replace(resultHref); } catch { navigationTarget.current = null; cancel(); }
  }, [resultHref, router, cover, cancel, reducedMotion]);
  const advance = useCallback(() => {
    if (stage === 6) { navigate(); return; }
    if (stage === 0) setLeavingIntro(true);
    setStage(current => Math.min(current + 1, 6));
  }, [stage, navigate]);
  useEffect(() => { router.prefetch(resultHref); }, [router, resultHref]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    const visibility = () => setHidden(document.hidden);
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => { media.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  useEffect(() => { if (reducedMotion === true) navigate(); }, [reducedMotion, navigate]);
  useEffect(() => {
    if (countdown.current.stage !== stage) countdown.current = { stage, remaining: holds[stage] };
    const remaining = countdown.current.remaining;
    setRemainingMs(remaining);
    if (reducedMotion !== false || creditOpen || hidden || (!preload.ready && stage > 0)) return;
    const startedAt = performance.now();
    const update = () => {
      countdown.current.remaining = Math.max(0, remaining - (performance.now() - startedAt));
      setRemainingMs(countdown.current.remaining);
    };
    const tick = window.setInterval(update, 100);
    const timer = window.setTimeout(advance, remaining);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(timer);
      countdown.current.remaining = Math.max(0, remaining - (performance.now() - startedAt));
    };
  }, [stage, creditOpen, hidden, preload.ready, reducedMotion, advance]);
  useEffect(() => {
    if (!leavingIntro) return;
    const timer = window.setTimeout(() => setLeavingIntro(false), 650);
    return () => window.clearTimeout(timer);
  }, [leavingIntro]);
  const brandActive = stage === 0 || stage === 6;
  const chapter = Math.max(0, Math.min(stage - 1, 4));
  const title = [result.country, result.city, result.competition, result.stadium, "Your match."][chapter];
  const photo = stage === 1 ? photos.country : stage === 2 ? photos.city : stage === 4 ? photos.stadium : undefined;
  const stageName = brandActive ? stage === 0 ? "Your next football weekend." : "Fixture locked. Opening your saved trip." : stage === 5 ? `${result.homeTeam} versus ${result.awayTeam}.` : `${labels[chapter]}: ${title}.`;
  const elapsedPercent = Math.max(0, Math.min(100, (1 - remainingMs / holds[stage]) * 100));
  return <main className={`site-shell ticket-reveal journal-reveal ${reducedMotion ? "journal-reduced" : ""}`} data-playback={creditOpen || hidden ? "paused" : "playing"} data-active-stage={reducedMotion === null ? "pending" : reducedMotion ? "opening-result" : stages[stage]}>
    <header className="journal-live-header"><Link href="/" aria-label="Matchbound home">MATCHBOUND</Link><span>{preview ? "DESIGN PREVIEW · EXAMPLE FIXTURE" : "ONE MATCH. A NEW STORY."}</span></header>
    <h1 className="sr-only">Your locked football fixture</h1>
    {(!brandActive || leavingIntro) && <section className="journal-live-card" key={stage} aria-label="Your locked fixture" data-stage={stages[stage]}>
      <div className="journal-live-progress" aria-label={`Chapter ${chapter+1} of 5`}>{labels.map((label,i)=><span key={label} className={i<chapter?"on":i===chapter?"is-loading":""} aria-current={i===chapter?"step":undefined}><i style={i===chapter ? { background: `conic-gradient(var(--journal-lime) ${elapsedPercent * 3.6}deg, var(--journal-paper) 0deg)` } : undefined}/>{label}</span>)}</div>
      <div className="journal-live-chapter"><span>CHAPTER 0{chapter+1}</span><span>0{chapter+1} / 05</span></div>
      <h2>{title}</h2><p className="journal-live-label">{["The destination", "The city", "The competition", "The ground", "The clubs"][chapter]}</p>
      {stage===3 ? <div className="journal-live-art journal-editorial journal-league"><CompetitionEmblemMark identity={result.visualIdentity}/><strong>{result.competition}</strong><p>The weekend has a stage.</p></div> : stage===5 ? <div className="journal-live-art journal-clubs"><FixtureTeams identity={result.visualIdentity} homeTeam={result.homeTeam} awayTeam={result.awayTeam}><span className="journal-live-versus">v</span></FixtureTeams><p>One match.<br/><em>A new story.</em></p><span>{result.stadium} / {result.city}</span></div> : <JournalArtwork onCreditToggle={setCreditOpen} photo={photo} usable={Boolean(photo && preload.loaded.includes(photo.src))}>
        {stage===1 ? <><CountryFlagMark identity={result.visualIdentity}/><strong>{result.country}</strong><p>It starts here.</p></> : stage===2 ? <><strong>{result.city}</strong><p>Football takes you places.</p></> : <><span className="journal-ground-lines" aria-hidden="true"><i/><i/><i/></span><strong>{result.stadium}</strong><p>Your weekend has a home.</p></>}
      </JournalArtwork>}
      <p className="journal-live-caption">{stage===1?"Your next chapter starts here.":stage===2?"A new city. A different weekend.":stage===4?"Imagine the walk to the ground.":"Football takes you places."}</p>
    </section>}
    {(brandActive || leavingIntro) && <section className={`reveal-beat ticket-brand is-visible ${leavingIntro ? "journal-brand-leaving" : ""}`} data-stage={leavingIntro ? "brand-intro" : stages[stage]} aria-hidden="true"><BrandLockup caption={stage===6?"Fixture locked":"Your next football weekend"}/></section>}
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{reducedMotion===null?"Preparing your weekend.":reducedMotion?"Opening your saved fixture.":stageName}</p>
  </main>;
}
