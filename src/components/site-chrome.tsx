import Link from "next/link";

export function SiteHeader() {
  return <header className="topbar"><Link className="wordmark" href="/" aria-label="Matchbound home">matchbound<span>•</span></Link><p>European football trips</p></header>;
}
export function SiteFooter() {
  return <footer className="site-footer"><span>Football takes you places.</span><span>Matchbound ©</span></footer>;
}
