import type { DrawResultSnapshot } from "./result";

export type VisualAssetKind = "countryFlag" | "competitionEmblem" | "teamCrest";

export type VisualAssetDisplayPolicy = Readonly<{
  /** Internal-development switch. This never represents public display rights. */
  internalPreviewEnabled: boolean;
  /** Exact HTTPS origins supplied by the licensed visual-asset provider. */
  allowedOrigins: readonly string[];
}>;

type ProviderVisualIdentityInput = Readonly<{
  competitionEmblemUrl: string | null;
  countryFlagUrl: string | null;
  homeTeamCrestUrl: string | null;
  awayTeamCrestUrl: string | null;
}>;

/**
 * Provider-hosted art is optional. Persist it only when at least one field is
 * available so older/dev fixtures retain the exact same graceful fallback.
 */
export function drawVisualIdentity(input: ProviderVisualIdentityInput): DrawResultSnapshot["visualIdentity"] | undefined {
  const identity = {
    competitionEmblemUrl: input.competitionEmblemUrl ?? undefined,
    countryFlagUrl: input.countryFlagUrl ?? undefined,
    homeTeamCrestUrl: input.homeTeamCrestUrl ?? undefined,
    awayTeamCrestUrl: input.awayTeamCrestUrl ?? undefined,
  };
  return Object.values(identity).some(Boolean) ? identity : undefined;
}

/**
 * A snapshot may retain upstream provenance, but it is never automatically a
 * permission to render third-party artwork. Rendering is opt-in by policy and
 * only accepts a credential-free HTTPS URL from an approved provider origin.
 */
export function publicVisualAssetUrl(
  value: string | undefined,
  policy: VisualAssetDisplayPolicy,
): string | undefined {
  if (!value || !policy.internalPreviewEnabled) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return policy.allowedOrigins.includes(url.origin) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function internalVisualAssetPolicy(
  internalPreviewEnabled: boolean,
  environment: string | undefined,
): VisualAssetDisplayPolicy {
  const enabled = internalPreviewEnabled && environment !== "production";
  return {
    internalPreviewEnabled: enabled,
    allowedOrigins: enabled ? ["https://crests.football-data.org"] : [],
  };
}

export function shouldRenderVisualAsset(src: string | undefined, hasFailed: boolean): boolean {
  return Boolean(src) && !hasFailed;
}

export function shouldRenderTeamCrestPair(
  homeSrc: string | undefined,
  awaySrc: string | undefined,
  hasFailed: boolean,
): boolean {
  return Boolean(homeSrc && awaySrc) && !hasFailed;
}
