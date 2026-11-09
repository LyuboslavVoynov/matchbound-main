"use client";
import { useState } from "react";
import { canonicalTripUrl } from "@/domain/sharing";

export function CopyLink({ resultPath, labelled = false }: Readonly<{ resultPath: string; labelled?: boolean }>) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  return <><button className="share-button copy-link" onClick={async () => {
    try { await navigator.clipboard.writeText(canonicalTripUrl(window.location.origin, resultPath)); setStatus("copied"); } catch { setStatus("error"); }
  }}>{labelled&&<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/></svg>}{status === "copied" ? "Link copied" : labelled ? "Copy link" : "Copy trip link"}</button><span className="sr-only" role="status">{status === "copied" ? "Trip link copied." : ""}</span>{status === "error" && <p className="copy-error" role="alert">Couldn’t copy the link. Copy it from your browser address bar.</p>}</>;
}
