import { DrawForm } from "./draw-form";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function Home() {
  return <main className="site-shell home-page"><SiteHeader /><div className="home-content">
    <section className="hero"><p className="heroicon">Europe. A match. Your trip.</p><h1>Your next<br />football weekend.</h1><p className="intro">Pick your dates. Discover a match and the city that comes with it.</p></section>
    <DrawForm />
    <section className="how" aria-label="How Matchbound works"><p className="eyebrow">A trip worth getting out for</p><ol className="steps"><li><b>01 / Dates</b><span>You pick the window.</span></li><li><b>02 / Draw</b><span>We lock the fixture.</span></li><li><b>03 / Go</b><span>Make a weekend of it.</span></li></ol></section>
  </div><SiteFooter /></main>;
}
