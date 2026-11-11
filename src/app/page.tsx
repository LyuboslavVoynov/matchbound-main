/* eslint-disable @next/next/no-img-element -- fixed, approved provider artwork in a decorative example. */
import { DrawForm } from "./draw-form";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function Home() {
  return <main className="site-shell home-page group-chat-home"><SiteHeader />
    <div className="group-landing-content">
      <section className="group-story"><p className="eyebrow">Less “we should”. More “we’re going”.</p>
        <h1>Take the group chat<br /><em>somewhere.</em></h1>
        <p>You’ve talked about a football weekend for months. Pick the dates. We’ll give you a match, a city and a reason to finally go.</p>
      </section>
      <DrawForm />
      <figure className="group-illustration" aria-label="An example of turning a group chat into a football weekend. The illustrated London fixture is not your draw.">
        <div className="weekend-chat" aria-hidden="true"><p className="weekend-chat-title">The weekend crew</p><p className="chat-bubble chat-question">Football trip this year?</p><p className="chat-bubble chat-reply">We keep saying that…</p><p className="chat-bubble chat-plan">Right. Pick a weekend.</p></div>
        <div className="weekend-ticket" aria-hidden="true"><div className="weekend-ticket-header"><span>Your football weekend</span><span className="example-label">Example</span></div>
          <div className="weekend-ticket-body"><p className="weekend-ticket-city">London</p><p className="weekend-ticket-ground">England · Emirates Stadium</p>
            <div className="weekend-ticket-teams"><div><img src="https://crests.football-data.org/57.png" width="48" height="48" alt="" /><span>Arsenal</span></div><span className="weekend-ticket-vs">VS</span><div><img src="https://crests.football-data.org/61.png" width="48" height="48" alt="" /><span>Chelsea</span></div></div>
          </div><div className="weekend-ticket-footer"><span>One match. A new story.</span><span>Matchbound</span></div>
        </div>
      </figure>
      <section className="group-invitation"><h2>A real plan starts here.</h2><p>Your dates become one confirmed fixture. The country, city and clubs? That’s the surprise.</p></section>
      <section className="weekend-preview" aria-labelledby="weekend-preview-title">
        <div><p className="eyebrow">The weekend starts with a fixture</p><h2 id="weekend-preview-title">One draw.<br />A whole weekend.</h2></div>
        <ul className="weekend-benefits"><li><h3>A match to go for.</h3><p>A confirmed fixture for the dates you choose.</p></li><li><h3>A city to make a weekend of.</h3><p>The destination is part of the surprise.</p></li><li><h3>A plan to send the group.</h3><p>One saved link. Everyone on the same page.</p></li></ul>
      </section>
    </div><SiteFooter />
  </main>;
}
