"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { DrawResultSnapshot } from "@/domain/result";
import { CompetitionEmblemMark, CountryFlagMark, TeamCrestPair, useVisualIdentityReadiness } from "@/components/visual-identity";

type RevealExperienceProps = Readonly<{ result: DrawResultSnapshot; resultHref: string }>;
export function RevealExperience({ result, resultHref }: RevealExperienceProps) {
  const router = useRouter();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [stage, setStage] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const exitTimer = useRef<number | undefined>(undefined);
  const readiness = useVisualIdentityReadiness(result.visualIdentity);
  const readinessRef = useRef(readiness);

  useEffect(() => { readinessRef.current = readiness; }, [readiness]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion !== false) return;
    const timers: number[] = [];
    let cancelled = false;
    const pause = (milliseconds: number) => new Promise<void>((resolve) => {
      timers.push(window.setTimeout(resolve, milliseconds));
    });
    const waitForMark = async (mark: keyof typeof readinessRef.current) => {
      const startedAt = Date.now();
      while (readinessRef.current[mark] === "loading" && Date.now() - startedAt < 500 && !cancelled) await pause(100);
    };
    const run = async () => {
      await pause(1700); await waitForMark("country"); if (cancelled) return; setStage(1);
      await pause(1600); if (cancelled) return; setStage(2);
      await pause(1250); await waitForMark("competition"); if (cancelled) return; setStage(3);
      await pause(1600); if (cancelled) return; setStage(4);
      await pause(1250); await waitForMark("clubs"); if (cancelled) return; setStage(5);
      await pause(1800); if (!cancelled) setStage(6);
    };
    void run();
    return () => { cancelled = true; timers.forEach(window.clearTimeout); };
  }, [reducedMotion]);

  useEffect(() => () => {
    if (exitTimer.current !== undefined) window.clearTimeout(exitTimer.current);
  }, []);

  function handleResultNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (
      reducedMotion === true || isLeaving || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    ) return;

    event.preventDefault();
    setIsLeaving(true);
    exitTimer.current = window.setTimeout(() => router.push(resultHref), 1080);
  }

  const immediate = reducedMotion === true;
  return <main className={`reveal-page ${immediate ? "reveal-page--reduced" : ""} ${isLeaving ? "reveal-page--leaving" : ""}`}>
    <header className="topbar"><Link className="wordmark" href="/">MATCHBOUND<span>•</span></Link><p>Fixture locked</p></header>
    <span className="reveal-handoff-wordmark" aria-hidden="true">MATCHBOUND<span>•</span></span>
    <span className="reveal-handoff-ball" aria-hidden="true"><i /></span>
    <section className="reveal-content" aria-label="Your locked fixture">
      <div className="reveal-stages">
        <section aria-hidden={immediate ? undefined : stage !== 0} className={`reveal-beat reveal-picking ${stage === 0 ? "is-visible" : ""}`} data-stage="picking"><p>Matchbound</p><h1>Picking your next<br /><i>European trip.</i></h1><span className="reveal-picking-dots" aria-hidden="true"><i /><i /><i /></span></section>
        <section aria-hidden={immediate ? undefined : stage !== 1} className={`reveal-beat reveal-country ${stage === 1 ? "is-visible" : ""}`} data-stage="country"><p>Country</p><CountryFlagMark identity={result.visualIdentity} /><h1>{result.country}</h1></section>
        <section aria-hidden={immediate ? undefined : stage !== 2} className={`reveal-beat ${stage === 2 ? "is-visible" : ""}`} data-stage="city"><p>City</p><h2>{result.city}</h2></section>
        <section aria-hidden={immediate ? undefined : stage !== 3} className={`reveal-beat reveal-competition-stage ${stage === 3 ? "is-visible" : ""}`} data-stage="competition"><p>Competition</p><CompetitionEmblemMark identity={result.visualIdentity} /><h2>{result.competition}</h2></section>
        <section aria-hidden={immediate ? undefined : stage !== 4} className={`reveal-beat ${stage === 4 ? "is-visible" : ""}`} data-stage="stadium"><p>Stadium</p><h2>{result.stadium}</h2></section>
        <section aria-hidden={immediate ? undefined : stage !== 5} className={`reveal-beat reveal-clubs ${stage === 5 ? "is-visible" : ""}`} data-stage="clubs"><p>Your clubs</p><TeamCrestPair identity={result.visualIdentity} /><span className="reveal-club-fallback">Two clubs. One weekend.</span></section>
        <section aria-hidden={immediate ? undefined : stage !== 6} className={`reveal-beat reveal-match ${stage === 6 ? "is-visible" : ""}`} data-stage="match"><p>Match</p><TeamCrestPair identity={result.visualIdentity} /><h2><span>{result.homeTeam}</span><i>v</i><span>{result.awayTeam}</span></h2></section>
      </div>
      <p className="sr-only" aria-live="polite">{stage === 6 ? `Your match is revealed: ${result.homeTeam} v ${result.awayTeam}.` : ""}</p>
      <Link className={`reveal-result-link ${stage === 6 ? "is-ready" : ""}`} href={resultHref} onClick={handleResultNavigation}>View match details <span>↗</span></Link>
    </section>
    <footer><span>Confirmed fixture</span><span>Result persisted</span></footer>
  </main>;
}
