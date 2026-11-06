import Link from "next/link";

export default function NotFound() {
  return <main className="draw-state"><p className="kicker">Matchbound</p><h1>This trip link<br /><i>does not exist.</i></h1><Link href="/">Back to Matchbound ↗</Link></main>;
}
