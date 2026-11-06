import "dotenv/config";
import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { and, eq, isNotNull } from "drizzle-orm";
import { createDb } from "@/db/client";
import { competitions, draws, fixtures, venues } from "@/db/schema";
import type { DrawResultSnapshot } from "@/domain/result";

async function saveDraw(transform: (result: DrawResultSnapshot) => DrawResultSnapshot = (result) => result) {
  const db = createDb();
  const [fixture] = await db.select({
    id: fixtures.id, kickoffDate: fixtures.kickoffDate, kickoffAt: fixtures.kickoffAt,
    homeTeam: fixtures.homeTeam, awayTeam: fixtures.awayTeam, stadium: venues.stadium, city: venues.city, timezone: venues.timezone,
    competition: competitions.name, country: competitions.country, officialTicketUrl: fixtures.officialTicketUrl,
    competitionEmblemUrl: competitions.emblemUrl, countryFlagUrl: competitions.areaFlagUrl,
    homeTeamCrestUrl: fixtures.homeTeamCrestUrl, awayTeamCrestUrl: fixtures.awayTeamCrestUrl,
  }).from(fixtures).innerJoin(competitions, eq(fixtures.competitionId, competitions.id)).innerJoin(venues, eq(fixtures.venueId, venues.id))
    .where(and(eq(competitions.providerCompetitionCode, "PL"), isNotNull(fixtures.homeTeamCrestUrl), isNotNull(fixtures.awayTeamCrestUrl), isNotNull(competitions.emblemUrl), isNotNull(competitions.areaFlagUrl))).limit(1);
  if (!fixture) throw new Error("Expected an enriched Premier League fixture.");
  const token = randomBytes(24).toString("base64url");
  const result = transform({
    competition: fixture.competition, country: fixture.country, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam,
    kickoffDate: fixture.kickoffDate, kickoffAt: fixture.kickoffAt.toISOString(), timezone: fixture.timezone,
    stadium: fixture.stadium, city: fixture.city, officialTicketUrl: fixture.officialTicketUrl,
    visualIdentity: {
      competitionEmblemUrl: fixture.competitionEmblemUrl!, countryFlagUrl: fixture.countryFlagUrl!,
      homeTeamCrestUrl: fixture.homeTeamCrestUrl!, awayTeamCrestUrl: fixture.awayTeamCrestUrl!,
    },
  });
  await db.insert(draws).values({ shareToken: token, fixtureId: fixture.id, tripStartDate: fixture.kickoffDate, tripEndDate: fixture.kickoffDate, expiresAt: new Date(Date.now() + 86400000), resultSnapshot: result });
  return { token, result, cleanup: () => db.delete(draws).where(eq(draws.shareToken, token)) };
}

async function expectLoadedImages(page: Page) {
  await expect(page.locator(".identity-flag img")).toHaveCount(1);
  await expect(page.locator(".identity-emblem img")).toHaveCount(1);
  await expect(page.locator(".identity-crest-pair img")).toHaveCount(2);
  expect(await page.locator(".identity-flag img, .identity-emblem img, .identity-crest-pair img").evaluateAll((images) =>
    images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0),
  )).toBe(true);
}

async function settleAnimations(page: Page, selector: string) {
  const root = page.locator(selector);
  await expect(root).toHaveCSS("opacity", "1");
  await root.evaluate(async (element) => {
    await Promise.all(element.getAnimations({ subtree: true })
      .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => undefined)));
  });
}

test("loads provider marks through the reveal and persisted result", async ({ page }, testInfo) => {
  const draw = await saveDraw();
  try {
    await page.goto(`/m/${draw.token}/reveal`);
    await expect(page.locator('[data-stage="country"]')).toHaveAttribute("aria-hidden", "false", { timeout: 5_000 });
    await expect(page.locator('[data-stage="country"] img')).toBeVisible();
    await expect(page.locator('[data-stage="competition"]')).toHaveAttribute("aria-hidden", "false", { timeout: 5_000 });
    await expect(page.locator('[data-stage="competition"] img')).toBeVisible();
    await expect(page.locator('[data-stage="clubs"]')).toHaveAttribute("aria-hidden", "false", { timeout: 5_000 });
    await expect(page.locator('[data-stage="clubs"] img')).toHaveCount(2);
    await expect(page.getByRole("link", { name: "View match details" })).toBeVisible({ timeout: 5_000 });
    await settleAnimations(page, ".reveal-stages");
    await expect(page.locator('[data-stage="match"]')).toHaveCSS("opacity", "1");
    await expect(page.locator('[data-stage="clubs"]')).toHaveCSS("opacity", "0");
    await page.screenshot({ path: testInfo.outputPath("reveal.png"), fullPage: true });
    await page.getByRole("link", { name: "View match details" }).click();
    await page.waitForURL(`/m/${draw.token}`);
    await expectLoadedImages(page);
    await expect(page.locator(".venue .identity-emblem")).toHaveCSS("background-color", "rgb(244, 241, 231)");
    await page.reload();
    await expectLoadedImages(page);
    await expect(page.locator(".match-card h1")).toContainText(draw.result.homeTeam);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await settleAnimations(page, ".match-card");
    await expect(page.locator(".artefact-place")).toHaveCSS("opacity", "1");
    await expect(page.locator(".venue")).toHaveCSS("opacity", "1");
    await page.screenshot({ path: testInfo.outputPath("result.png"), fullPage: true });
  } finally { await draw.cleanup(); }
});

test("keeps text and navigation when marks are missing, unapproved or fail to load", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const badUrl = "https://unapproved.example/mark.svg";
  const states = [
    (result: DrawResultSnapshot) => ({ ...result, visualIdentity: undefined }),
    (result: DrawResultSnapshot) => ({ ...result, visualIdentity: { competitionEmblemUrl: badUrl, countryFlagUrl: badUrl, homeTeamCrestUrl: badUrl, awayTeamCrestUrl: badUrl } }),
    (result: DrawResultSnapshot) => result,
  ];
  await page.route("https://crests.football-data.org/**", (route) => route.abort());
  const unapprovedRequests: string[] = [];
  await page.route("https://unapproved.example/**", (route) => { unapprovedRequests.push(route.request().url()); return route.abort(); });
  for (const transform of states) {
    const draw = await saveDraw(transform);
    try {
      await page.goto(`/m/${draw.token}/reveal`);
      await expect(page.getByText("Two clubs. One weekend.")).toBeVisible();
      await expect(page.getByRole("link", { name: "View match details" })).toBeVisible();
      await expect(page.locator(".identity-flag img, .identity-emblem img, .identity-crest-pair img")).toHaveCount(0);
      await page.getByRole("link", { name: "View match details" }).click();
      await page.waitForURL(`/m/${draw.token}`);
      await expect(page.locator(".match-card h1")).toContainText(draw.result.homeTeam);
      await expect(page.locator(".identity-flag img, .identity-emblem img, .identity-crest-pair img")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Copy trip link" })).toBeVisible();
    } finally { await draw.cleanup(); }
  }
  expect(unapprovedRequests).toEqual([]);
});
