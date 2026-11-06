import Link from "next/link";
import { ResultReady } from "@/components/result-handoff";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
export default function NotFound() {
  return <main className="site-shell"><ResultReady fallback /><SiteHeader /><section className="draw-state"><p className="eyebrow">Matchbound</p><h1>This trip link does not exist.</h1><p>Let’s find your next football weekend.</p><Link className="button" href="/">Back to Matchbound <span aria-hidden="true">↗</span></Link></section><SiteFooter /></main>;
}
