"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { DrawResultSnapshot } from "@/domain/result";
import { CompetitionEmblemMark, CountryFlagMark, FixtureTeams, useVisualIdentityReadiness } from "@/components/visual-identity";
import { useResultHandoff } from "@/components/result-handoff";
import { BrandLockup } from "@/components/brand-lockup";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const stages = ["brand-intro", "country", "city", "competition", "stadium", "clubs", "brand-outro"] as const;
// 17 seconds before navigation, plus at most three 500ms artwork waits.
const CARD_TRANSITION_MS = 650;
const BRAND_TRANSITION_MS = 800;
const holds = [1200, 1800, 1600, 1800, 1800, 2600, 1200];
const brandStage = (stage: number) => stage === 0 || stage === 6;

type RevealExperienceProps = Readonly<{ result: DrawResultSnapshot; resultHref: string }>;
export function RevealExperience({ result, resultHref }: RevealExperienceProps) {
  const router = useRouter();
  const { cover, cancel } = useResultHandoff();
  const navigationTarget = useRef<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [stage, setStage] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const readiness = useVisualIdentityReadiness(result.visualIdentity);
  const readinessRef = useRef(readiness);
  useEffect(() => { readinessRef.current = readiness; }, [readiness]);
  useEffect(() => { router.prefetch(resultHref); }, [router, resultHref]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion === null) return;
    let cancelled = false;
    const timers = new Set<number>();
    const navigate = () => {
      if (cancelled || navigationTarget.current === resultHref) return;
      navigationTarget.current = resultHref;
      if (!reducedMotion) cover(resultHref);
      try { router.replace(resultHref); } catch { cancel(); }
    };
    if (reducedMotion) {
      navigate();
      return () => { cancelled = true; };
    }
    const pause = (milliseconds: number) => new Promise<void>((resolve) => {
      const timer = window.setTimeout(() => { timers.delete(timer); resolve(); }, milliseconds);
      timers.add(timer);
    });
    const waitForMark = async (mark: keyof typeof readinessRef.current) => {
      const startedAt = performance.now();
      while (!cancelled && readinessRef.current[mark] === "loading" && performance.now() - startedAt < 500) await pause(50);
    };
    const run = async () => {
      setStage(0); setPrevious(null);
      await pause(BRAND_TRANSITION_MS + holds[0]);
      for (let next = 1; next < stages.length; next++) {
        if (cancelled) return;
        if (next === 1) await waitForMark("country");
        if (next === 3) await waitForMark("competition");
        if (next === 5) await waitForMark("clubs");
        if (cancelled) return;
        setPrevious(next - 1); setStage(next);
        await pause(brandStage(next) || brandStage(next - 1) ? BRAND_TRANSITION_MS : CARD_TRANSITION_MS);
        if (cancelled) return;
        setPrevious(null);
        await pause(holds[next]);
      }
      // Keep the closing brand on screen until the saved result replaces this route.
      navigate();
    };
    void run();
    return () => { cancelled = true; timers.forEach(window.clearTimeout); timers.clear(); };
  }, [reducedMotion, resultHref, router, cover, cancel]);

  const immediate = reducedMotion === true;
  const active = (value: number) => reducedMotion === false && stage === value;
  const brandActive = reducedMotion === false && brandStage(stage);
  const progress = immediate ? 6 : Math.min(stage, 6);
  const progressHidden = reducedMotion !== false || brandActive;
  const stageClass = (value: number, extra = "") => `reveal-beat ${extra} ${active(value) ? "is-visible" : ""} ${!immediate && previous === value ? "is-exiting" : ""}`;
  const stageName = ["Matchbound. Your next football weekend.", `Your country: ${result.country}.`, `Your city: ${result.city}.`, `Your competition: ${result.competition}.`, `Your stadium: ${result.stadium}.`, `Your clubs: ${result.homeTeam} versus ${result.awayTeam}.`, "Matchbound. Fixture locked."][stage];
  const brand = (value: 0 | 6) => <section aria-hidden={!active(value)} inert={!active(value)} className={stageClass(value, "ticket-brand")} data-stage={stages[value]}>
    <BrandLockup caption={value === 0 ? "Your next football weekend" : "Fixture locked"} />
  </section>;

  return <main className={`site-shell reveal-page ticket-reveal ${immediate ? "reveal-page--reduced" : ""}`} data-active-stage={reducedMotion === null ? "pending" : immediate ? "opening-result" : stages[stage]}>
    <div inert={brandActive} aria-hidden={brandActive || undefined}><SiteHeader /></div><h1 className="sr-only">Your locked football fixture</h1>
    <section className="reveal-content" aria-label="Your locked fixture">
      <div className={`ticket-progress ${progressHidden ? "is-hidden" : ""}`} aria-label={`Reveal progress: ${progress} of 6`} aria-hidden={progressHidden}>
        <span className="sr-only">{progress} of 6 stages complete</span>{[1, 2, 3, 4, 5, 6].map(value => <i key={value} className={progress >= value ? "on" : ""} aria-hidden="true" />)}
      </div>
      <div className="reveal-stages">
        {brand(0)}
        <section aria-hidden={!active(1)} inert={!active(1)} className={stageClass(1, "ticket-card reveal-country")} data-stage="country"><p className="eyebrow">Your country</p><CountryFlagMark identity={result.visualIdentity} /><h2>{result.country}</h2><p className="stage-note">It starts here.</p></section>
        <section aria-hidden={!active(2)} inert={!active(2)} className={stageClass(2, "ticket-card")} data-stage="city"><p className="eyebrow">Your city</p><p className="ticket-index">{result.country} /</p><h2>{result.city}</h2><p className="stage-note">Football takes you places.</p></section>
        <section aria-hidden={!active(3)} inert={!active(3)} className={stageClass(3, "ticket-card reveal-competition-stage")} data-stage="competition"><p className="eyebrow">Your competition</p><CompetitionEmblemMark identity={result.visualIdentity} /><h2>{result.competition}</h2></section>
        <section aria-hidden={!active(4)} inert={!active(4)} className={stageClass(4, "ticket-card")} data-stage="stadium"><p className="eyebrow">At the ground</p><p className="ticket-index">{result.city} /</p><h2>{result.stadium}</h2><p className="stage-note">Your weekend has a home.</p></section>
        <section aria-hidden={!active(5)} inert={!active(5)} className={stageClass(5, "ticket-card reveal-clubs")} data-stage="clubs"><p className="eyebrow">Your clubs</p><FixtureTeams identity={result.visualIdentity} homeTeam={result.homeTeam} awayTeam={result.awayTeam}><span className="ticket-versus" aria-hidden="true">VS</span></FixtureTeams><p className="stage-note">Two clubs. One weekend.</p></section>
        {brand(6)}
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{reducedMotion === null ? "" : immediate ? "Opening your saved fixture." : stageName}</p>
    </section>
    <div className="reveal-footer" inert={brandActive} aria-hidden={brandActive || undefined}><SiteFooter /></div>
  </main>;
}
