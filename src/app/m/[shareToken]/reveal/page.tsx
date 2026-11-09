import Link from "next/link";
import { notFound } from "next/navigation";
import { createDb } from "@/db/client";
import { findSharedDraw } from "@/db/draw-repository";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { findJournalVisuals } from "@/db/creative-repository";
import { RevealExperience } from "./reveal-experience";

export default async function RevealPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  const draw = await findSharedDraw(createDb(), shareToken);
  if (!draw) notFound();
  if (draw.expiresAt <= new Date()) return <main className="site-shell"><SiteHeader /><section className="draw-state"><p className="eyebrow">Matchbound</p><h1>This trip link has expired.</h1><p>Your next football weekend is still out there.</p><Link className="button" href="/">Draw another match <span aria-hidden="true">↗</span></Link></section><SiteFooter /></main>;
  const photos = await findJournalVisuals(createDb(), draw.resultSnapshot);
  return <RevealExperience photos={photos} result={draw.resultSnapshot} resultHref={`/m/${shareToken}`} />;
}
