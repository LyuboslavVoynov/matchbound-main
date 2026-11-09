import { findJournalVisuals } from "@/db/creative-repository";
import { MatchResult } from "@/components/match-result";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createDb } from "@/db/client";
import { findSharedDraw } from "@/db/draw-repository";
import { ResultReady } from "@/components/result-handoff";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default async function MatchPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  const draw = await findSharedDraw(createDb(), shareToken);
  if (!draw) notFound();
  if (draw.expiresAt <= new Date()) return <main className="site-shell"><ResultReady fallback /><SiteHeader /><section className="draw-state"><p className="eyebrow">Matchbound</p><h1>This trip link has expired.</h1><p>Your next football weekend is still out there.</p><Link className="button" href="/">Draw another match <span aria-hidden="true">↗</span></Link></section><SiteFooter /></main>;

  const photos = await findJournalVisuals(createDb(), draw.resultSnapshot);
  return <MatchResult backdrop={photos.stadium} result={draw.resultSnapshot} tripStartDate={draw.tripStartDate} tripEndDate={draw.tripEndDate} resultPath={`/m/${shareToken}`}/>;
}
