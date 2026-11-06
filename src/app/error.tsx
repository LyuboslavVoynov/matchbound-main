"use client";
import Link from "next/link";
import { ResultReady } from "@/components/result-handoff";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export default function ErrorPage({ reset }: Readonly<{ reset: () => void }>) {
  return <main className="site-shell"><ResultReady fallback /><SiteHeader /><section className="draw-state"><p className="eyebrow">Matchbound</p><h1>We couldn’t open this trip.</h1><p>Your saved link is still the place to start.</p><button className="button" onClick={reset}>Try again<span aria-hidden="true">↗</span></button><Link className="error-home" href="/">Back to Matchbound</Link></section><SiteFooter /></main>;
}
