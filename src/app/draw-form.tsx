"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TripCalendar } from "@/components/trip-calendar";
import { addCalendarDays } from "@/domain/calendar";
type FormState = "idle" | "loading" | "success" | "error";
export function DrawForm() {
  const [startDate, setStartDate] = useState(""); const [endDate, setEndDate] = useState(""); const [state, setState] = useState<FormState>("idle"); const [message, setMessage] = useState(""); const startInput = useRef<HTMLButtonElement>(null); const endInput = useRef<HTMLButtonElement>(null); const router = useRouter(); const maxEndDate = startDate ? addCalendarDays(startDate, 6) : undefined; const hasError = state === "error";
  const [includeUK, setIncludeUK] = useState(true);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const request = useRef<AbortController | null>(null);
  const handoff = useRef<number | undefined>(undefined);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; request.current?.abort(); if (handoff.current !== undefined) window.clearTimeout(handoff.current); };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting.current) return; if (!startDate || !endDate) { setState("error"); setMessage("Choose both trip dates to continue."); (startDate ? endInput : startInput).current?.focus(); return; }
    if (endDate < startDate || (maxEndDate && endDate > maxEndDate)) { setState("error"); setMessage("Choose a trip of up to seven calendar days, inclusive."); endInput.current?.focus(); return; }
    submitting.current = true; request.current = new AbortController(); setState("loading"); setMessage("");
    try { const response = await fetch("/api/draw", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ startDate, endDate, includeUK }), signal: request.current.signal }); const body = await response.json() as { error?: string; shareToken?: string }; if (!response.ok || !body.shareToken) throw new Error(body.error ?? "We couldn’t create a draw."); if (!mounted.current) return;
      setState("success");
      const target = `/m/${body.shareToken}/reveal`;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) router.push(target);
      else handoff.current = window.setTimeout(() => { if (mounted.current) router.push(target); }, 220); } catch (error) { if (!mounted.current) return; submitting.current = false; setState("error"); setMessage(error instanceof Error ? error.message : "We couldn’t create a draw."); }
  }
  return <form className="draw-form trip" data-state={state} onSubmit={submit} noValidate aria-busy={state === "loading"} aria-labelledby="trip-form-title">
    <h2 className="sectiontitle" id="trip-form-title">Give your weekend a kick-off.</h2>
    <TripCalendar startDate={startDate} endDate={endDate} onChange={(start, end) => { setStartDate(start); setEndDate(end); setMessage(""); setState("idle"); }} disabled={state === "loading" || state === "success"} hasError={hasError} startRef={startInput} endRef={endInput} />
    <p className="hint" id="date-hint">Up to 7 days. Confirmed fixtures only.</p>
    <div className="uk-match-preference">
      <div><label htmlFor="include-uk">Include UK matches</label><p id="uk-match-help">{includeUK ? "Keep home fixtures in the mix." : "Only matches outside the UK."}</p></div>
      <input id="include-uk" name="includeUK" type="checkbox" role="switch" checked={includeUK} onChange={event => { setIncludeUK(event.target.checked); setMessage(""); setState("idle"); }} disabled={state === "loading" || state === "success"} aria-describedby="uk-match-help uk-match-scope" />
    </div>
    <p className="uk-match-scope" id="uk-match-scope">UK means England, Scotland, Wales and Northern Ireland.</p>
    <button className="button" disabled={state === "loading" || state === "success"}>{state === "loading" ? "Drawing your match…" : state === "success" ? "Fixture locked" : "Draw my match"}<svg className="draw-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
    {message && <p id="draw-error" className="form-message" role="alert">{message}</p>}
  </form>;
}
