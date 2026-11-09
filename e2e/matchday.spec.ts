import "dotenv/config";
import { expect, test } from "@playwright/test";
import { saveMatchdayDraw } from "./helpers/saved-draw";

test("Matchday surfaces match the selected direction and show sample-aligned matchup numbers", async ({ page }, info) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Take the group chat/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Trip starts", exact: true })).toContainText("Choose a date");
  await expect(page.getByRole("button", { name: "Trip ends", exact: true })).toContainText("Choose a date");
  await page.screenshot({ path: info.outputPath("home.png"), fullPage: true });
  const draw = await saveMatchdayDraw();
  try {
    await page.goto(`/m/${draw.token}`);
    await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
    await expect(page.locator(".result-locked")).toHaveText("Fixture locked");
    await expect(page.locator(".trip-dates")).toHaveText("27–29 November 2026");
    await expect(page.getByRole("link", { name: "View match details" })).toHaveCount(0);
    await expect(page.locator(".ticket-brand")).toHaveCount(0);
    await expect(page.locator(".matchuptop")).toContainText("Last 3 meetings");
    await expect(page.locator(".ledger-summary strong")).toHaveText(["1", "1", "1"]);
    await expect(page.locator(".ledger-score")).toHaveText(["3–0", "2–1", "1–1"]);
    await expect(page.getByRole("button", { name: "Reveal my beer" })).toBeVisible();
    await expect(page.locator(".fixture-heading")).toHaveText("Arsenal v Chelsea");
    await expect(page.locator(".competition .identity-emblem img")).toHaveCount(1);
    await expect(page.locator(".fixture .teams img")).toHaveCount(2);
    await page.screenshot({ path: info.outputPath("result.png"), fullPage: true });
    await page.reload();
    await expect(page.locator(".ledger-summary strong")).toHaveText(["1", "1", "1"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await draw.cleanup(); }
});

test("long club names, a single meeting and reduced motion keep a usable layout", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const draw = await saveMatchdayDraw({ longNames: true, oneMeeting: true });
  try {
    await page.goto(`/m/${draw.token}/reveal`);
    await page.waitForURL(`/m/${draw.token}`);
    await expect(page.locator(".ticket-brand")).toHaveCount(0);
    await expect(page.locator(".matchuptop")).toContainText("Last 1 meeting");
    await expect(page.locator(".ledger-summary strong")).toHaveText(["0", "1", "0"]);
    await expect(page.locator(".ledger-score")).toHaveText(["1–1"]);
    await expect(page.locator(".clubname").first()).toHaveText(draw.result.homeTeam);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath("long-names.png"), fullPage: true });
  } finally { await draw.cleanup(); }
});

test("older saved draws omit unavailable extras and expired links remain clear", async ({ page }) => {
  const oldDraw = await saveMatchdayDraw({ noExtras: true });
  const expired = await saveMatchdayDraw({ expired: true });
  try {
    await page.goto(`/m/${oldDraw.token}`);
    await expect(page.locator(".fixture-heading")).toHaveText("Arsenal v Chelsea");
    await expect(page.locator(".ledger-empty")).toBeVisible();
    await expect(page.locator(".beer-ticket")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
    await page.goto(`/m/${expired.token}/reveal`);
    await expect(page.getByRole("heading", { name: "This trip link has expired." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Draw another match" })).toBeVisible();
  } finally { await oldDraw.cleanup(); await expired.cleanup(); }
});
