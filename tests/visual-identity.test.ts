import { describe, expect, it } from "vitest";
import { drawVisualIdentity, internalVisualAssetPolicy, publicVisualAssetUrl, shouldRenderTeamCrestPair, shouldRenderVisualAsset } from "@/domain/visual-identity";

describe("provider visual identity snapshots", () => {
  it("retains every available provider asset for a persisted draw", () => {
    expect(drawVisualIdentity({
      competitionEmblemUrl: "https://assets.example/league.svg",
      countryFlagUrl: "https://assets.example/flag.svg",
      homeTeamCrestUrl: "https://assets.example/home.svg",
      awayTeamCrestUrl: "https://assets.example/away.svg",
    })).toEqual({
      competitionEmblemUrl: "https://assets.example/league.svg",
      countryFlagUrl: "https://assets.example/flag.svg",
      homeTeamCrestUrl: "https://assets.example/home.svg",
      awayTeamCrestUrl: "https://assets.example/away.svg",
    });
  });

  it("omits visual identity when an older or development fixture has no provider assets", () => {
    expect(drawVisualIdentity({ competitionEmblemUrl: null, countryFlagUrl: null, homeTeamCrestUrl: null, awayTeamCrestUrl: null })).toBeUndefined();
  });

  it("does not treat an upstream asset URL as display permission", () => {
    expect(publicVisualAssetUrl("https://crests.football-data.org/1.svg", {
      internalPreviewEnabled: false,
      allowedOrigins: ["https://crests.football-data.org"],
    })).toBeUndefined();
  });

  it("only permits credential-free HTTPS artwork from an approved origin in an internal preview", () => {
    const policy = { internalPreviewEnabled: true, allowedOrigins: ["https://assets.licensed.example"] };
    expect(publicVisualAssetUrl("https://assets.licensed.example/club.svg", policy)).toBe("https://assets.licensed.example/club.svg");
    expect(publicVisualAssetUrl("http://assets.licensed.example/club.svg", policy)).toBeUndefined();
    expect(publicVisualAssetUrl("https://token@assets.licensed.example/club.svg", policy)).toBeUndefined();
    expect(publicVisualAssetUrl("https://assets.licensed.example:444/club.svg", policy)).toBeUndefined();
    expect(publicVisualAssetUrl("https://other.example/club.svg", policy)).toBeUndefined();
  });

  it("removes a failed individual mark and the full crest pair", () => {
    expect(shouldRenderVisualAsset("https://assets.licensed.example/flag.svg", false)).toBe(true);
    expect(shouldRenderVisualAsset("https://assets.licensed.example/flag.svg", true)).toBe(false);
    expect(shouldRenderTeamCrestPair("https://assets.licensed.example/home.svg", "https://assets.licensed.example/away.svg", false)).toBe(true);
    expect(shouldRenderTeamCrestPair("https://assets.licensed.example/home.svg", "https://assets.licensed.example/away.svg", true)).toBe(false);
  });

  it("only enables provider marks for an explicit non-production internal preview", () => {
    expect(internalVisualAssetPolicy(false, "development")).toEqual({ internalPreviewEnabled: false, allowedOrigins: [] });
    expect(internalVisualAssetPolicy(true, "development")).toEqual({ internalPreviewEnabled: true, allowedOrigins: ["https://crests.football-data.org"] });
    expect(internalVisualAssetPolicy(true, "production")).toEqual({ internalPreviewEnabled: false, allowedOrigins: [] });
  });
});
