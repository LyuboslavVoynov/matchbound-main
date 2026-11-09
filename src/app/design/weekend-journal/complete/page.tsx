import Link from "next/link";
import { ResultReady } from "@/components/result-handoff";
export default function JournalComplete(){return <main className="site-shell"><ResultReady/><section className="draw-state"><p className="eyebrow">Design preview complete</p><h1 data-handoff-heading tabIndex={-1}>Fixture locked.</h1><p>This was an illustrative trip. In the real draw, this transition opens your saved match details.</p><Link className="button" href="/design/weekend-journal">Back to the storyboards →</Link></section></main>}
