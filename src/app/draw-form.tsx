"use client";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
type FormState = "idle" | "loading" | "success" | "error";
function addDays(value: string, days: number) { if (!value) return undefined; const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
export function DrawForm() {
  const [startDate, setStartDate] = useState(""); const [endDate, setEndDate] = useState(""); const [state, setState] = useState<FormState>("idle"); const [message, setMessage] = useState(""); const startInput = useRef<HTMLInputElement>(null); const endInput = useRef<HTMLInputElement>(null); const router = useRouter(); const maxEndDate = useMemo(() => addDays(startDate, 6), [startDate]); const hasError = state === "error";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!startDate || !endDate) { setState("error"); setMessage("Choose both trip dates to continue."); (startDate ? endInput : startInput).current?.focus(); return; }
    if (endDate < startDate || (maxEndDate && endDate > maxEndDate)) { setState("error"); setMessage("Choose a trip of up to seven calendar days, inclusive."); endInput.current?.focus(); return; }
    setState("loading"); setMessage("");
    try { const response = await fetch("/api/draw", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ startDate, endDate }) }); const body = await response.json() as { error?: string; shareToken?: string }; if (!response.ok || !body.shareToken) throw new Error(body.error ?? "We couldn’t create a draw."); router.push(`/m/${body.shareToken}/reveal`); } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "We couldn’t create a draw."); }
  }
  return <form className="draw-form" onSubmit={submit} noValidate aria-busy={state === "loading"}><div className="dates"><label>Trip starts<input ref={startInput} required type="date" aria-invalid={hasError} aria-describedby={hasError ? "draw-error" : undefined} value={startDate} onChange={(e) => { setStartDate(e.target.value); if (endDate && endDate < e.target.value) setEndDate(""); }} /></label><span className="date-rule" aria-hidden="true">→</span><label>Trip ends<input ref={endInput} required type="date" aria-invalid={hasError} aria-describedby={hasError ? "draw-error" : undefined} min={startDate || undefined} max={maxEndDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label></div><p className="hint">Maximum 7 calendar days</p><button disabled={state === "loading"}>{state === "loading" ? "Drawing your match…" : "Draw my match"}</button>{message && <p id="draw-error" className={`form-message ${state}`} role="alert">{message}</p>}</form>;
}
