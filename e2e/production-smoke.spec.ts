import "dotenv/config";
import { expect, test } from "@playwright/test";
import { and, eq, gte } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { createDb } from "../src/db/client";
import { competitions, draws, fixtures, venues } from "../src/db/schema";
import { findSharedDraw } from "../src/db/draw-repository";
import { findBeerSignalsForFixture } from "../src/db/beer-signal-repository";
import { drawVisualIdentity } from "../src/domain/visual-identity";
import { selectTripDates } from "./helpers/trip-dates";
import type { DrawResultSnapshot } from "../src/domain/result";

// Explicit opt-in: the default local suite must never create live test draws.
test.skip(!process.env.PRODUCTION_BASE_URL, "Use playwright.production.config.ts with an explicit target.");
const uk = ["England", "Scotland", "Wales", "Northern Ireland", "United Kingdom"];

test("live landing to reveal to saved non-UK trip", async ({ page }, info) => {
  const db = createDb(); let token: string | undefined;
  const [available] = await db.select({ date: fixtures.kickoffDate }).from(fixtures)
    .innerJoin(venues, eq(fixtures.venueId, venues.id)).innerJoin(competitions, eq(fixtures.competitionId, competitions.id))
    .where(and(eq(venues.country, "Germany"), eq(venues.active, true), eq(venues.reviewed, true), eq(competitions.active, true), eq(fixtures.status, "confirmed"), gte(fixtures.kickoffDate, new Date().toISOString().slice(0, 10))))
    .orderBy(fixtures.kickoffDate).limit(1);
  expect(available, "A future reviewed fixture is needed for the live smoke run").toBeTruthy();
  try {
    await page.goto("/");
    const toggle = page.getByRole("switch", { name: "Include UK matches" });
    await expect(toggle).toBeChecked();
    await selectTripDates(page, available.date, available.date);
    await toggle.focus(); await page.keyboard.press("Space"); await expect(toggle).not.toBeChecked();
    const request = page.waitForResponse(response => response.url().endsWith("/api/draw") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Draw my match" }).click();
    const response = await request;
    expect(response.status(), await response.text()).toBe(201);
    token = (await response.json()).shareToken;
    expect(token).toBeTruthy();
    const saved = await findSharedDraw(db, token!);
    expect(saved, "The configured validation database must match this deployment").toBeTruthy();
    expect(uk).not.toContain(saved.resultSnapshot.country);
    await page.waitForURL("**/m/" + token + "/reveal");
    const started = Date.now(); const seen = new Set<string>();
    await expect(async () => {
      const stage = await page.locator("main").getAttribute("data-active-stage");
      if (stage && stage !== "pending") seen.add(stage);
      expect(new URL(page.url()).pathname).toBe("/m/" + token);
    }).toPass({ timeout: 40000, intervals: [200] });
    expect([...seen]).toEqual(["brand-intro", "country", "city", "competition", "stadium", "clubs", "brand-outro"]);
    expect(Date.now() - started).toBeGreaterThan(20000);
    await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
    await expect(page.locator(".country")).toContainText(saved.resultSnapshot.country);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(saved.resultSnapshot.city);
    await expect(page.locator(".fixture-heading")).toHaveText(saved.resultSnapshot.homeTeam + " v " + saved.resultSnapshot.awayTeam);
    const share = page.getByRole("link", { name: "Share on WhatsApp" });
    const href = new URL((await share.getAttribute("href"))!);
    expect(href.origin + href.pathname).toBe("https://wa.me/");
    expect(href.searchParams.get("text")).toContain(new URL("/m/" + token, page.url()).href);
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: "Copy link", exact: true }).click();
    await expect(page.getByRole("button", { name: "Link copied", exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(new URL("/m/" + token, page.url()).href);
    for (const [index, meeting] of (saved.resultSnapshot.headToHead?.meetings ?? []).entries()) {
      await expect(page.locator(".ledger-score").nth(index)).toHaveText(meeting.homeScore + "–" + meeting.awayScore);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath("live-result.png"), fullPage: true, animations: "disabled" });
  } finally { if (token) await db.delete(draws).where(eq(draws.shareToken, token)); }
});

for (const destination of [
  { country: "Germany", city: "Munich", stadium: "Allianz Arena" },
  { country: "Portugal", city: "Rio Maior", stadium: "Estádio Municipal de Rio Maior" },
]) test("saved " + destination.city + " trip retains artwork, identity and beer facts", async ({ page }, info) => {
  const db = createDb(); const token = randomBytes(24).toString("base64url");
  const [row] = await db.select({ fixture: fixtures, venue: venues, competition: competitions }).from(fixtures)
    .innerJoin(venues, eq(fixtures.venueId, venues.id)).innerJoin(competitions, eq(fixtures.competitionId, competitions.id))
    .where(and(eq(venues.country, destination.country), eq(venues.city, destination.city), eq(venues.stadium, destination.stadium), eq(venues.reviewed, true), eq(fixtures.status, "confirmed"))).limit(1);
  expect(row).toBeTruthy();
  const beerSignals = await findBeerSignalsForFixture(db, row.venue.country, row.venue.city);
  const result: DrawResultSnapshot = { ...destination, competition: row.competition.name, homeTeam: row.fixture.homeTeam, awayTeam: row.fixture.awayTeam, kickoffAt: row.fixture.kickoffAt.toISOString(), kickoffDate: row.fixture.kickoffDate, timezone: row.venue.timezone, officialTicketUrl: row.fixture.officialTicketUrl, beerSignals, visualIdentity: drawVisualIdentity({ competitionEmblemUrl: row.competition.emblemUrl, countryFlagUrl: row.competition.areaFlagUrl, homeTeamCrestUrl: row.fixture.homeTeamCrestUrl, awayTeamCrestUrl: row.fixture.awayTeamCrestUrl }) };
  await db.insert(draws).values({ shareToken: token, fixtureId: row.fixture.id, resultSnapshot: result, tripStartDate: result.kickoffDate, tripEndDate: result.kickoffDate, expiresAt: new Date(Date.now() + 3600000) });
  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/m/" + token + "/reveal"); await page.waitForURL("**/m/" + token);
    const image = page.locator(".fixture-backdrop img"); await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    if (destination.country === "Portugal") await expect(image).toHaveAttribute("src", /\/storage\/v1\/object\/public\/matchbound-creatives\/journal\/ppl-stadium-rio-maior-v1\//);
    const identity = result.visualIdentity;
    const expectedMarks = Number(!!identity?.countryFlagUrl) + Number(!!identity?.competitionEmblemUrl) + (identity?.homeTeamCrestUrl && identity?.awayTeamCrestUrl ? 2 : 0);
    await expect(page.locator(".fixturebody img,.competition img,.country img")).toHaveCount(expectedMarks);
    for (const img of await page.locator(".fixturebody img,.competition img,.country img").all()) await expect.poll(() => img.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    if (beerSignals?.countryBrand) {
      await page.getByRole("button", { name: "Reveal my beer" }).click();
      await expect(page.locator(".beer-ticket")).toHaveAttribute("data-beer-state", "revealed");
      await expect(page.locator(".beer-ticket h2")).toHaveText(beerSignals.countryBrand.brandName);
      if (beerSignals.countryBrand.sourceUrl) await expect(page.getByRole("link", { name: "Brewery source" })).toHaveAttribute("href", beerSignals.countryBrand.sourceUrl);
      await page.reload(); await expect(page.locator(".beer-ticket h2")).toHaveText(beerSignals.countryBrand.brandName);
    } else await expect(page.locator(".beer-ticket")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath(destination.city + ".png"), fullPage: true, animations: "disabled" });
    if (destination.country === "Germany") {
      // A fresh context avoids a successfully decoded image surviving a reload's network failure.
      const fallbackContext = await page.context().browser()!.newContext({ viewport: page.viewportSize(), reducedMotion: "reduce" });
      try {
        await fallbackContext.route("**/*", route => route.request().resourceType() === "image" ? route.abort() : route.continue());
        const fallbackPage = await fallbackContext.newPage(); await fallbackPage.goto(page.url());
        await expect(fallbackPage.getByRole("heading", { level: 1 })).toHaveText(destination.city);
        await expect(fallbackPage.locator(".fixturebody")).toContainText(result.homeTeam);
        await expect(fallbackPage.locator(".fixturebody")).toContainText(result.awayTeam);
        await expect(fallbackPage.locator(".fixture-backdrop img")).toHaveCount(0);
        await expect(fallbackPage.getByRole("link", { name: "Share on WhatsApp" })).toBeVisible();
        expect(await fallbackPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      } finally { await fallbackContext.close(); }
    }
  } finally { await db.delete(draws).where(eq(draws.shareToken, token)); }
});
