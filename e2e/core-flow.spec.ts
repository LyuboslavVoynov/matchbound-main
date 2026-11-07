import { selectTripDate, selectTripDates } from "./helpers/trip-dates";
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { eq, isNotNull } from "drizzle-orm";
import { createDb } from "@/db/client";
import { findSharedDraw } from "@/db/draw-repository";
import { competitions, draws, fixtures, venues } from "@/db/schema";

async function createDrawFromHome(page: import("@playwright/test").Page) {
  await page.goto("/");
  await selectTripDates(page, "2026-08-01", "2026-08-07");
  await page.getByRole("button", { name: "Draw my match" }).click();
  await page.waitForURL(/\/m\/[^/]+(?:\/reveal)?$/);
  return new URL(page.url()).pathname.replace(/\/reveal$/, "") + "/reveal";
}

test("enforces the inclusive seven-day limit before drawing", async ({ page }) => {
  await page.goto("/");
  await selectTripDate(page, "Trip starts", "2026-08-01");
  await page.locator('[data-calendar-date="2026-08-08"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-calendar-date="2026-08-08"]')).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("button", { name: "Trip ends", exact: true })).toContainText("Choose a date");
  await page.locator('[data-calendar-date="2026-08-07"]').click();
  await expect(page.locator("#calendar-selection")).toContainText("7 calendar days");
});

test("reports a range with no eligible fixtures", async ({ page }) => {
  await page.goto("/");
  await selectTripDates(page, "2028-01-01", "2028-01-07");
  await page.getByRole("button", { name: "Draw my match" }).click();
  await expect(page.locator("#draw-error")).toHaveText("No eligible confirmed fixtures were found for these dates.");
});

test("draws once, reveals the persisted result, and remains stable on refresh", async ({ page }) => {
  const revealPath = await createDrawFromHome(page);
  const shareToken = revealPath.split("/")[2];
  const storedDraw = await findSharedDraw(createDb(), shareToken);
  expect(storedDraw?.resultSnapshot).not.toHaveProperty("placeMedia");
  await expect(page.locator('[data-stage="brand-intro"]')).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator('[data-stage="country"]')).toHaveAttribute("aria-hidden", "false", { timeout: 3_000 });
  await page.waitForURL(/\/m\/[^/]+$/, { timeout: 22_000 });
  await expect(page.getByRole("link", { name: "View match details" })).toHaveCount(0);
  const resultPath = new URL(page.url()).pathname;
  expect(resultPath).toBe(revealPath.replace(/\/reveal$/, ""));
  const match = await page.locator(".fixture-heading").innerText();
  await expect(page.getByRole("button", { name: "Copy trip link" })).toBeVisible();
  await page.reload();
  await expect.poll(() => page.locator(".fixture-heading").innerText()).toBe(match);
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
  await expect(page.locator(".reveal-clubs")).toHaveClass(/is-visible/, { timeout: 15_000 });
  await expect(page.getByText("Two clubs. One weekend.")).toBeVisible({ timeout: 7_000 });
});

test("opens the saved result directly when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const revealPath = await createDrawFromHome(page);
  await page.waitForURL(revealPath.replace(/\/reveal$/, ""));
  await expect(page.locator(".ticket-brand")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy trip link" })).toBeVisible();
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
    if (reducedMotion === "no-preference") {
      await expect(page.locator('[data-stage="stadium"] h2')).toHaveText(stored!.resultSnapshot.stadium);
      expect(await page.locator('[data-stage="city"], [data-stage="stadium"]').evaluateAll((stages) =>
        stages.every((stage) => [stage, ...stage.querySelectorAll("*")].every((element) =>
          getComputedStyle(element).backgroundImage === "none" && element.tagName !== "IMG")),
      )).toBe(true);
    }
    await page.waitForURL(`/m/${shareToken}`, { timeout: 22_000 });
    await expect(page.getByText("Legacy photo attribution", { exact: false })).toHaveCount(0);
    expect(photoRequests).toEqual([]);
  }
  await expect(page.locator(".venue strong")).toHaveText(stored!.resultSnapshot.stadium);
});
