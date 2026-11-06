"use client";
import { useState } from "react";
import { canonicalTripUrl } from "@/domain/sharing";

export function CopyLink({ resultPath }: Readonly<{ resultPath: string }>) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  return <><button className="share-button copy-link" onClick={async () => {
    try { await navigator.clipboard.writeText(canonicalTripUrl(window.location.origin, resultPath)); setStatus("copied"); } catch { setStatus("error"); }
  }}>{status === "copied" ? "Link copied" : "Copy trip link"}</button><span className="sr-only" role="status">{status === "copied" ? "Trip link copied." : ""}</span>{status === "error" && <p className="copy-error" role="alert">Couldn’t copy the link. Copy it from your browser address bar.</p>}</>;
}
