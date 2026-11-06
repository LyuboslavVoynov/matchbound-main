import type { DrawResultSnapshot } from "./result";

export type VisualAssetKind = "countryFlag" | "competitionEmblem" | "teamCrest";

export type VisualAssetDisplayPolicy = Readonly<{
  /** Whether approved provider artwork is displayed. */
  enabled: boolean;
  /** Exact HTTPS origins supplied by the visual-asset provider. */
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
 * Stored artwork renders only from an approved HTTPS provider origin.
 * Credential-bearing and unapproved URLs always use the text fallback.
 */
export function publicVisualAssetUrl(
  value: string | undefined,
  policy: VisualAssetDisplayPolicy,
): string | undefined {
  if (!value || !policy.enabled) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return policy.allowedOrigins.includes(url.origin) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Shared by development and production; no preview flag is required. */
export function providerVisualAssetPolicy(): VisualAssetDisplayPolicy {
  return {
    enabled: true,
    allowedOrigins: ["https://crests.football-data.org"],
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
