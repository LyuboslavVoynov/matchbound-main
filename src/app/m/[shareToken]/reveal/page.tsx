import Link from "next/link";
import { notFound } from "next/navigation";
import { createDb } from "@/db/client";
import { findSharedDraw } from "@/db/draw-repository";
import { RevealExperience } from "./reveal-experience";

export default async function RevealPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  const draw = await findSharedDraw(createDb(), shareToken);
  if (!draw) notFound();
  if (draw.expiresAt <= new Date()) return <main className="draw-state"><p className="kicker">Matchbound</p><h1>This trip link<br /><i>has expired.</i></h1><Link href="/">Draw another match ↗</Link></main>;
  return <RevealExperience result={draw.resultSnapshot} resultHref={`/m/${shareToken}`} />;
}
