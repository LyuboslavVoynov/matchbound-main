"use client";
/* eslint-disable @next/next/no-img-element -- sources are dynamically policy-validated at runtime. */

import { useEffect, useState } from "react";
import { visualAssetDisplayPolicy } from "@/config/visual-assets";
import { publicVisualAssetUrl } from "@/domain/visual-identity";
import type { DrawResultSnapshot } from "@/domain/result";

type Identity = DrawResultSnapshot["visualIdentity"];

function assetUrl(value: string | undefined) {
  return publicVisualAssetUrl(value, visualAssetDisplayPolicy);
}

export type VisualAssetStatus = "idle" | "loading" | "ready" | "failed";

function useAssetStatus(src: string | undefined): VisualAssetStatus {
  const [state, setState] = useState<Readonly<{ src: string | undefined; status: VisualAssetStatus }>>({ src, status: src ? "loading" : "idle" });
  const status = state.src === src ? state.status : src ? "loading" : "idle";

  useEffect(() => {
    if (!src) {
      setState({ src, status: "idle" });
      return;
    }

    let active = true;
    const image = new Image();
    image.onload = () => active && setState({ src, status: "ready" });
    image.onerror = () => active && setState({ src, status: "failed" });
    image.src = src;
    return () => { active = false; };
  }, [src]);

  return status;
}

function useCrestPairStatus(home: string | undefined, away: string | undefined): VisualAssetStatus {
  const key = home && away ? `${home}|${away}` : undefined;
  const [state, setState] = useState<Readonly<{ key: string | undefined; status: VisualAssetStatus }>>({ key, status: key ? "loading" : "idle" });
  const status = state.key === key ? state.status : key ? "loading" : "idle";

  useEffect(() => {
    if (!home || !away || !key) {
      setState({ key, status: "idle" });
      return;
    }

    let active = true;
    let settled = false;
    let loaded = 0;
    const complete = (next: VisualAssetStatus) => {
      if (!active || settled) return;
      settled = true;
      setState({ key, status: next });
    };
    const images = [home, away].map((src) => {
      const image = new Image();
      image.onload = () => {
        loaded += 1;
        if (loaded === 2) complete("ready");
      };
      image.onerror = () => complete("failed");
      image.src = src;
      return image;
    });

    return () => {
      active = false;
      images.forEach((image) => { image.onload = null; image.onerror = null; });
    };
  }, [away, home, key]);

  return status;
}

/** Preloads every optional mark so reveal pacing can wait briefly for it. */
export function useVisualIdentityReadiness(identity: Identity) {
  const country = useAssetStatus(assetUrl(identity?.countryFlagUrl));
  const competition = useAssetStatus(assetUrl(identity?.competitionEmblemUrl));
  const clubs = useCrestPairStatus(assetUrl(identity?.homeTeamCrestUrl), assetUrl(identity?.awayTeamCrestUrl));
  return { country, competition, clubs } as const;
}

export function CountryFlagMark({ identity }: Readonly<{ identity: Identity }>) {
  const src = assetUrl(identity?.countryFlagUrl);
  const status = useAssetStatus(src);
  if (!src || status === "failed") return null;
  return <span className={`identity-flag ${status === "ready" ? "identity-asset--ready" : "identity-asset--pending"}`} aria-hidden={status !== "ready"}>
    {status === "ready" && <img src={src} alt="" />}
  </span>;
}

export function CompetitionEmblemMark({ identity }: Readonly<{ identity: Identity }>) {
  const src = assetUrl(identity?.competitionEmblemUrl);
  const status = useAssetStatus(src);
  if (!src || status === "failed") return null;
  return <span className={`identity-emblem ${status === "ready" ? "identity-asset--ready" : "identity-asset--pending"}`} aria-hidden={status !== "ready"}>
    {status === "ready" && <img src={src} alt="" />}
  </span>;
}

/** Both club marks are present together, or neither is shown. */
export function TeamCrestPair({ identity }: Readonly<{ identity: Identity }>) {
  const home = assetUrl(identity?.homeTeamCrestUrl);
  const away = assetUrl(identity?.awayTeamCrestUrl);
  const status = useCrestPairStatus(home, away);
  if (!home || !away || status === "failed") return null;
  if (status !== "ready") return <div className="identity-crest-pair identity-asset--pending" aria-hidden="true" />;

  return <div className="identity-crest-pair identity-asset--ready" aria-hidden="true">
    <img src={home} alt="" />
    <span>v</span>
    <img src={away} alt="" />
  </div>;
}
