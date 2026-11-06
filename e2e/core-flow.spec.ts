import "dotenv/config";
import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { and, eq, isNotNull } from "drizzle-orm";
import { createDb } from "@/db/client";
import { findSharedDraw } from "@/db/draw-repository";
import { competitions, draws, fixtures, venues } from "@/db/schema";

async function createDrawFromHome(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Trip starts").fill("2026-08-01");
  await page.getByLabel("Trip ends").fill("2026-08-07");
  await page.getByRole("button", { name: "Draw my match" }).click();
  await page.waitForURL(/\/m\/[^/]+\/reveal$/);
  return new URL(page.url()).pathname;
}

test("enforces the inclusive seven-day limit before drawing", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Trip starts").fill("2026-08-01");
  await page.getByLabel("Trip ends").fill("2026-08-08");
  await page.getByRole("button", { name: "Draw my match" }).click();
  await expect(page.locator("#draw-error")).toHaveText("Choose a trip of up to seven calendar days, inclusive.");
});

test("reports a range with no eligible fixtures", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Trip starts").fill("2028-01-01");
  await page.getByLabel("Trip ends").fill("2028-01-07");
  await page.getByRole("button", { name: "Draw my match" }).click();
  await expect(page.locator("#draw-error")).toHaveText("No eligible confirmed fixtures were found for these dates.");
});

test("draws once, reveals the persisted result, and remains stable on refresh", async ({ page }) => {
  const revealPath = await createDrawFromHome(page);
  const shareToken = revealPath.split("/")[2];
  const storedDraw = await findSharedDraw(createDb(), shareToken);
  expect(storedDraw?.resultSnapshot).not.toHaveProperty("placeMedia");
  await expect(page.locator('[data-stage="picking"]')).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator('[data-stage="country"]')).toHaveAttribute("aria-hidden", "false", { timeout: 3_000 });
  await expect(page.getByRole("link", { name: "View match details" })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("link", { name: "View match details" }).click();
  await page.waitForURL(/\/m\/[^/]+$/);
  const resultPath = new URL(page.url()).pathname;
  expect(resultPath).toBe(revealPath.replace(/\/reveal$/, ""));
  const match = await page.locator(".match-card h1").innerText();
  await expect(page.getByRole("button", { name: "Copy trip link" })).toBeVisible();
  await page.reload();
  await expect.poll(() => page.locator(".match-card h1").innerText()).toBe(match);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("shows explicit expired and invalid share states", async ({ page, request }) => {
  const drawResponse = await request.post("/api/draw", { data: { startDate: "2026-08-01", endDate: "2026-08-07" } });
  expect(drawResponse.status()).toBe(201);
  const { shareToken } = await drawResponse.json() as { shareToken: string };
  await createDb().update(draws).set({ expiresAt: new Date(Date.now() - 1_000) }).where(eq(draws.shareToken, shareToken));
  await page.goto(`/m/${shareToken}`);
  await expect(page.getByRole("heading")).toContainText("has expired");
  await page.goto("/m/not-a-real-matchbound-token");
  await expect(page.getByRole("heading")).toContainText("is not here");
});

test("renders only the stored official ticket link and the copy action", async ({ page }) => {
  const db = createDb();
  const [fixture] = await db.select({
    id: fixtures.id, officialTicketUrl: fixtures.officialTicketUrl, kickoffDate: fixtures.kickoffDate, kickoffAt: fixtures.kickoffAt,
    homeTeam: fixtures.homeTeam, awayTeam: fixtures.awayTeam, stadium: venues.stadium, city: venues.city, timezone: venues.timezone,
    competition: competitions.name, country: competitions.country,
  }).from(fixtures).innerJoin(competitions, eq(fixtures.competitionId, competitions.id)).innerJoin(venues, eq(fixtures.venueId, venues.id))
    .where(isNotNull(fixtures.officialTicketUrl)).limit(1);
  if (!fixture?.officialTicketUrl) throw new Error("Expected one development fixture with an official ticket URL.");

  const shareToken = randomBytes(24).toString("base64url");
  await db.insert(draws).values({
    shareToken, fixtureId: fixture.id, tripStartDate: fixture.kickoffDate, tripEndDate: fixture.kickoffDate,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    resultSnapshot: { competition: fixture.competition, country: fixture.country, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam, kickoffDate: fixture.kickoffDate, kickoffAt: fixture.kickoffAt.toISOString(), timezone: fixture.timezone, stadium: fixture.stadium, city: fixture.city, officialTicketUrl: fixture.officialTicketUrl },
  });
  await page.goto(`/m/${shareToken}`);
  await expect(page.getByRole("link", { name: "Get tickets" })).toHaveAttribute("href", fixture.officialTicketUrl);
  await expect(page.getByRole("button", { name: "Copy trip link" })).toBeVisible();
  await page.goto(`/m/${shareToken}/reveal`);
  await expect(page.locator(".reveal-clubs")).toHaveClass(/is-visible/, { timeout: 7_000 });
  await expect(page.getByText("Two clubs. One weekend.")).toBeVisible({ timeout: 7_000 });
});

test("renders a complete internal visual identity and keeps its snapshot immutable", async ({ page }) => {
  const db = createDb();
  const [fixture] = await db.select({
    id: fixtures.id, competitionId: fixtures.competitionId, kickoffDate: fixtures.kickoffDate, kickoffAt: fixtures.kickoffAt,
    homeTeam: fixtures.homeTeam, awayTeam: fixtures.awayTeam, stadium: venues.stadium, city: venues.city, timezone: venues.timezone,
    officialTicketUrl: fixtures.officialTicketUrl, homeTeamCrestUrl: fixtures.homeTeamCrestUrl, awayTeamCrestUrl: fixtures.awayTeamCrestUrl,
    competition: competitions.name, country: competitions.country, competitionEmblemUrl: competitions.emblemUrl, countryFlagUrl: competitions.areaFlagUrl,
  }).from(fixtures).innerJoin(competitions, eq(fixtures.competitionId, competitions.id)).innerJoin(venues, eq(fixtures.venueId, venues.id))
    .where(and(isNotNull(fixtures.homeTeamCrestUrl), isNotNull(fixtures.awayTeamCrestUrl), isNotNull(competitions.emblemUrl), isNotNull(competitions.areaFlagUrl))).limit(1);
  if (!fixture?.homeTeamCrestUrl || !fixture.awayTeamCrestUrl || !fixture.competitionEmblemUrl || !fixture.countryFlagUrl) throw new Error("Expected one fully enriched provider fixture.");

  const visualIdentity = { competitionEmblemUrl: fixture.competitionEmblemUrl, countryFlagUrl: fixture.countryFlagUrl, homeTeamCrestUrl: fixture.homeTeamCrestUrl, awayTeamCrestUrl: fixture.awayTeamCrestUrl };
  const shareToken = randomBytes(24).toString("base64url");
  await db.insert(draws).values({
    shareToken, fixtureId: fixture.id, tripStartDate: fixture.kickoffDate, tripEndDate: fixture.kickoffDate,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    resultSnapshot: { competition: fixture.competition, country: fixture.country, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam, kickoffDate: fixture.kickoffDate, kickoffAt: fixture.kickoffAt.toISOString(), timezone: fixture.timezone, stadium: fixture.stadium, city: fixture.city, officialTicketUrl: fixture.officialTicketUrl, visualIdentity },
  });
  try {
    await page.goto(`/m/${shareToken}`);
    await expect(page.locator(".identity-flag img")).toHaveCount(1);
    await expect(page.locator(".identity-emblem img")).toHaveCount(1);
    await expect(page.locator(".identity-crest-pair img")).toHaveCount(2);
    await db.update(fixtures).set({ homeTeamCrestUrl: "https://test.invalid/new-home.svg", awayTeamCrestUrl: "https://test.invalid/new-away.svg" }).where(eq(fixtures.id, fixture.id));
    await db.update(competitions).set({ emblemUrl: "https://test.invalid/new-league.svg", areaFlagUrl: "https://test.invalid/new-flag.svg" }).where(eq(competitions.id, fixture.competitionId));
    await expect.poll(async () => (await findSharedDraw(db, shareToken))?.resultSnapshot.visualIdentity).toEqual(visualIdentity);
  } finally {
    await db.update(fixtures).set({ homeTeamCrestUrl: fixture.homeTeamCrestUrl, awayTeamCrestUrl: fixture.awayTeamCrestUrl }).where(eq(fixtures.id, fixture.id));
    await db.update(competitions).set({ emblemUrl: fixture.competitionEmblemUrl, areaFlagUrl: fixture.countryFlagUrl }).where(eq(competitions.id, fixture.competitionId));
  }
});

test("uses the direct result link when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const revealPath = await createDrawFromHome(page);
  await expect(page.getByRole("link", { name: "View match details" })).toBeVisible();
  await page.getByRole("link", { name: "View match details" }).click();
  await page.waitForURL(revealPath.replace(/\/reveal$/, ""));
});


test("ignores city and stadium photos in legacy saved draws", async ({ page, request }) => {
  const response = await request.post("/api/draw", { data: { startDate: "2026-08-01", endDate: "2026-08-07" } });
  expect(response.status()).toBe(201);
  const { shareToken } = await response.json() as { shareToken: string };
  const db = createDb();
  const stored = await findSharedDraw(db, shareToken);
  expect(stored).toBeDefined();
  expect(stored!.resultSnapshot).not.toHaveProperty("placeMedia");
  const legacyPhoto = {
    imageUrl: "https://test.invalid/legacy-photo.jpg", sourcePageUrl: "https://test.invalid/photo",
    attribution: "Legacy photo attribution", licenceName: "Legacy licence", licenceUrl: "https://test.invalid/licence", focalPoint: "center",
  };
  const legacySnapshot = { ...stored!.resultSnapshot, placeMedia: { city: legacyPhoto, stadium: legacyPhoto } };
  await db.update(draws).set({ resultSnapshot: legacySnapshot }).where(eq(draws.shareToken, shareToken));

  const photoRequests: string[] = [];
  await page.route("https://test.invalid/**", (route) => {
    photoRequests.push(route.request().url());
    return route.abort();
  });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto(`/m/${shareToken}/reveal`);
    await expect(page.locator('[data-stage="stadium"] h2')).toHaveText(stored!.resultSnapshot.stadium);
    await expect(page.getByRole("link", { name: "View match details" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Legacy photo attribution", { exact: false })).toHaveCount(0);
    expect(await page.locator('[data-stage="city"], [data-stage="stadium"]').evaluateAll((stages) =>
      stages.every((stage) => [stage, ...stage.querySelectorAll("*")].every((element) =>
        getComputedStyle(element).backgroundImage === "none" && element.tagName !== "IMG")),
    )).toBe(true);
    expect(photoRequests).toEqual([]);
  }
  await page.getByRole("link", { name: "View match details" }).click();
  await page.waitForURL(`/m/${shareToken}`);
  await expect(page.locator(".venue strong")).toHaveText(stored!.resultSnapshot.stadium);
});
