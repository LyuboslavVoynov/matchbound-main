"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLockup } from "./brand-lockup";

type Handoff = Readonly<{ from: string; target: string; phase: "covered" | "revealing" }>;
const HandoffContext = createContext({ cover: (_target: string) => {}, ready: (_target: string) => {}, cancel: () => {} });
export function useResultHandoff() { return useContext(HandoffContext); }

/** Lives above the route boundary, so the settled closing logo survives navigation. */
export function ResultHandoffProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const focusAfterReveal = useRef(false);
  const cover = useCallback((target: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    focusAfterReveal.current = false;
    setHandoff(current => current?.target === target ? current : { from: pathRef.current, target, phase: "covered" });
  }, []);
  const ready = useCallback((target: string) => {
    setHandoff(current => current?.target === target && current.phase === "covered" ? { ...current, phase: "revealing" } : current);
  }, []);
  const cancel = useCallback(() => { focusAfterReveal.current = false; setHandoff(null); }, []);

  useLayoutEffect(() => {
    pathRef.current = pathname;
    // Back, home or another trip must never inherit an unrelated overlay.
    setHandoff(current => current && pathname !== current.from && pathname !== current.target ? null : current);
  }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { if (media.matches) cancel(); };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [cancel]);
  useLayoutEffect(() => {
    if (!handoff && focusAfterReveal.current) {
      focusAfterReveal.current = false;
      document.querySelector<HTMLElement>("[data-handoff-heading]")?.focus({ preventScroll: true });
    }
  }, [handoff]);

  const context = useMemo(() => ({ cover, ready, cancel }), [cover, ready, cancel]);
  return <HandoffContext.Provider value={context}>
    <div className={`route-surface ${handoff?.phase === "revealing" ? "is-arriving" : ""}`} data-handoff-phase={handoff?.phase ?? "idle"} inert={Boolean(handoff)} aria-hidden={handoff ? true : undefined}>{children}</div>
    {handoff && <div className={`result-handoff-overlay ticket-brand ${handoff.phase === "revealing" ? "is-revealing" : ""}`} data-handoff-target={handoff.target} aria-hidden="true" onAnimationEnd={event => {
      if (event.target !== event.currentTarget || event.animationName !== "result-handoff-lift") return;
      focusAfterReveal.current = true;
      setHandoff(null);
    }}><BrandLockup caption="Fixture locked" /></div>}
    <p className="sr-only" role="status" aria-live="polite">{handoff ? "Fixture locked. Opening your saved trip." : ""}</p>
  </HandoffContext.Provider>;
}

/** A real committed result (not a pathname guess or timeout) starts the reveal. */
export function ResultReady({ fallback = false }: Readonly<{ fallback?: boolean }>) {
  const pathname = usePathname();
  const { ready, cancel } = useResultHandoff();
  useLayoutEffect(() => { if (fallback) cancel(); else ready(pathname); }, [pathname, ready, cancel, fallback]);
  return null;
}
