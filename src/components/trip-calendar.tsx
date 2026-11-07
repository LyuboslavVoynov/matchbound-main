"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { addCalendarDays, calendarDayCount, monthCalendarDays, shiftCalendarMonth } from "@/domain/calendar";

const shortDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const asDate = (value: string) => new Date(`${value}T12:00:00Z`);
type Props = { startDate: string; endDate: string; onChange: (start: string, end: string) => void; disabled: boolean; hasError: boolean; startRef: React.RefObject<HTMLButtonElement | null>; endRef: React.RefObject<HTMLButtonElement | null> };

export function TripCalendar({ startDate, endDate, onChange, disabled, hasError, startRef, endRef }: Props) {
  const [open, setOpen] = useState(false);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(() => (startDate || today).slice(0, 7));
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [focused, setFocused] = useState(startDate || today);
  const grid = useRef<HTMLDivElement>(null);
  const maxEnd = startDate ? addCalendarDays(startDate, 6) : "";
  const unavailable = (day: string) => selecting === "end" && Boolean(startDate) && (day < startDate || day > maxEnd);
  const days = monthCalendarDays(month);
  const monthStart = `${month}-01`;
  const tabDate = days.includes(focused) ? focused : monthStart;

  function focusDay(day: string) {
    setMonth(day.slice(0, 7)); setFocused(day);
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-calendar-date="${day}"]`)?.focus());
  }
  function changeMonth(offset: number) {
    const next = shiftCalendarMonth(`${month}-01`, offset);
    setMonth(next.slice(0, 7)); setFocused(next);
  }
  function pick(day: string) {
    if (disabled || unavailable(day)) return;
    setFocused(day); setMonth(day.slice(0, 7));
    if (selecting === "start" || !startDate) {
      onChange(day, ""); setSelecting("end");
    } else {
      onChange(startDate, day); setSelecting("start"); setOpen(false);
      requestAnimationFrame(() => endRef.current?.focus());
    }
  }
  function keydown(event: KeyboardEvent<HTMLButtonElement>, day: string) {
    const weekday = (asDate(day).getUTCDay() + 6) % 7;
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekday, End: 6 - weekday };
    if (event.key in offsets) { event.preventDefault(); focusDay(addCalendarDays(day, offsets[event.key])); }
    else if (event.key === "PageUp" || event.key === "PageDown") { event.preventDefault(); focusDay(shiftCalendarMonth(day, event.key === "PageUp" ? -1 : 1)); }
  }
  function edit(target: "start" | "end") {
    setSelecting(target); setOpen(true);
    const date = target === "end" ? endDate || startDate || today : startDate || today;
    setMonth(date.slice(0, 7)); setFocused(date);
  }
  const count = startDate && endDate ? calendarDayCount(startDate, endDate) : 0;
  const prompt = selecting === "end" ? "Choose your trip end date. Up to seven calendar days, including the start date." : "Choose your trip start date.";
  return <div className="trip-calendar" onKeyDown={event => { if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); (selecting === "start" ? startRef : endRef).current?.focus(); } }} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className="calendar-date-fields">
      <button ref={startRef} type="button" className={`calendar-date-field ${open && selecting === "start" ? "is-active" : ""}`} onClick={() => edit("start")} disabled={disabled} aria-label="Trip starts" aria-expanded={open} aria-controls="trip-calendar-panel" aria-pressed={open && selecting === "start"} data-invalid={hasError || undefined} aria-describedby={hasError ? "draw-error" : "calendar-selection"}><span>Trip starts</span><strong>{startDate ? shortDate.format(asDate(startDate)) : "Choose a date"}</strong></button>
      <button ref={endRef} type="button" className={`calendar-date-field ${open && selecting === "end" ? "is-active" : ""}`} onClick={() => edit("end")} disabled={disabled} aria-label="Trip ends" aria-expanded={open} aria-controls="trip-calendar-panel" aria-pressed={open && selecting === "end"} data-invalid={hasError || undefined} aria-describedby={hasError ? "draw-error" : "calendar-selection"}><span>Trip ends</span><strong>{endDate ? shortDate.format(asDate(endDate)) : "Choose a date"}</strong></button>
    </div>
    <div id="trip-calendar-panel" hidden={!open}>
    <div className="calendar-month-nav"><h3 id="calendar-month" aria-live="polite">{monthName.format(asDate(monthStart))}</h3><div><button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} disabled={disabled}><span aria-hidden="true">‹</span></button><button type="button" aria-label="Next month" onClick={() => changeMonth(1)} disabled={disabled}><span aria-hidden="true">›</span></button></div></div>
    <p className="calendar-prompt" id="calendar-instructions">{selecting === "end" ? "Now choose your end date · up to 7 days" : "Choose your start date"}</p>
    <div ref={grid} role="grid" aria-labelledby="calendar-month" aria-describedby="calendar-instructions" className="calendar-grid">
      <div role="row" className="calendar-week"><span role="columnheader" aria-label="Monday">M</span><span role="columnheader" aria-label="Tuesday">T</span><span role="columnheader" aria-label="Wednesday">W</span><span role="columnheader" aria-label="Thursday">T</span><span role="columnheader" aria-label="Friday">F</span><span role="columnheader" aria-label="Saturday">S</span><span role="columnheader" aria-label="Sunday">S</span></div>
      {Array.from({ length: 6 }, (_, week) => <div role="row" className="calendar-week" key={week}>{days.slice(week * 7, week * 7 + 7).map(day => {
        const start = day === startDate, end = day === endDate;
        const selected = Boolean(startDate && (endDate ? day >= startDate && day <= endDate : start));
        return <div role="gridcell" key={day} aria-selected={selected} className={`calendar-cell ${selected ? "in-range" : ""} ${start ? "range-start" : ""} ${end ? "range-end" : ""}`}><button type="button" data-calendar-date={day} tabIndex={tabDate === day ? 0 : -1} aria-label={`${fullDate.format(asDate(day))}${start ? ", trip starts" : ""}${end ? ", trip ends" : ""}`} aria-current={day === today ? "date" : undefined} aria-disabled={disabled || unavailable(day)} className={`${day.slice(0, 7) !== month ? "other-month" : ""} ${start || end ? "range-endpoint" : ""}`} onFocus={() => setFocused(day)} onClick={() => pick(day)} onKeyDown={event => keydown(event, day)}>{Number(day.slice(8))}</button></div>;
      })}</div>)}
    </div>
    <button type="button" className="calendar-clear" onClick={() => { setOpen(false); (selecting === "start" ? startRef : endRef).current?.focus(); }}>Close calendar</button>
    </div>
    <div className="calendar-selection" id="calendar-selection" role="status" aria-live="polite" aria-atomic="true"><span>{count ? `${shortDate.format(asDate(startDate))} – ${shortDate.format(asDate(endDate))}` : prompt}</span>{count > 0 && <strong>{count} calendar {count === 1 ? "day" : "days"}</strong>}</div>
    {(startDate || endDate) && <button type="button" className="calendar-clear" disabled={disabled} onClick={() => { onChange("", ""); setSelecting("start"); setOpen(false); startRef.current?.focus(); }}>Clear dates</button>}
  </div>;
}
