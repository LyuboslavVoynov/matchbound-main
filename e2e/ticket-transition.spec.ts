import { selectTripDates } from "./helpers/trip-dates";
import "dotenv/config";
import { expect, test } from "@playwright/test";
import { saveMatchdayDraw } from "./helpers/saved-draw";

const sequence = ["brand-intro", "country", "city", "competition", "stadium", "clubs", "brand-outro"];

test("slower Ticket cards lead automatically to one locked fixture and details page", async ({ page }, info) => {
  const draw = await saveMatchdayDraw();
  try {
    await page.goto("/");
    await page.clock.install({ time: new Date("2026-11-06T12:00:00Z") });
    await page.clock.pauseAt(new Date("2026-11-06T12:00:01Z"));
    await page.goto(`/m/${draw.token}/reveal`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-intro");
    await expect(page.locator('[data-stage="clubs"] .teams img')).toHaveCount(2);
    const seen: string[] = [];
    const started: Record<string, number> = {};
    let prior = "";
    const captured = new Set<string>();
    let arrivedAt = 0;
    for (let time = 0; time <= 25000; time += 100) {
      if (new URL(page.url()).pathname === `/m/${draw.token}`) { arrivedAt = time; break; }
      const stage = await page.locator("main").getAttribute("data-active-stage");
      if (!stage) { arrivedAt = time; break; }
      if (stage !== prior) { seen.push(stage); started[stage] = time; prior = stage; }
      if (time < 16000) await expect(page.locator('.reveal-beat[aria-hidden="false"]')).toHaveCount(1);
      await expect(page.getByRole("link", { name: "View match details" })).toHaveCount(0);
      await expect(page.locator(".reveal-match, .belowreveal")).toHaveCount(0);
      if (!captured.has(stage) && time % 500 === 0) {
        await page.screenshot({ path: info.outputPath(`${stage}.png`), fullPage: !stage.startsWith("brand"), animations: "disabled" });
        captured.add(stage);
      }
      await page.clock.runFor(100);
    }
    expect(seen).toEqual(sequence);
    expect(started.city - started.country).toBeGreaterThanOrEqual(2400);
    expect(started["brand-outro"] - started.clubs).toBeGreaterThanOrEqual(3000);
    expect(arrivedAt).toBeGreaterThanOrEqual(16000);
    // The scripted reveal is 17–18.5s; route completion also depends on server I/O.
    expect(arrivedAt).toBeLessThanOrEqual(25000);
    await page.waitForURL(`/m/${draw.token}`);
    await expect(page.locator(".result-locked")).toHaveText("Fixture locked");
    await expect(page.locator(".fixture-heading")).toHaveText("Arsenal v Chelsea");
    await expect(page.locator(".matchuptop")).toContainText("Last 3 meetings");
    await expect(page.getByText("A beer from England")).toBeVisible();
    await expect(page.getByRole("link", { name: "View match details" })).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await page.getByRole("button", { name: "Copy trip link" }).focus();
    await expect(page.getByRole("button", { name: "Copy trip link" })).toBeFocused();
    await page.screenshot({ path: info.outputPath("locked-details.png"), fullPage: true });
    await page.reload();
    await expect(page.locator(".fixture-heading")).toHaveText("Arsenal v Chelsea");
    await expect(page.locator(".ticket-brand")).toHaveCount(0);
    await page.goBack();
    await page.waitForURL("/");
    await expect(page.getByRole("heading", { name: "Your next football weekend." })).toBeVisible();
  } finally { await draw.cleanup(); }
});

test("closing brand stays while details load and reduced motion cancels an active handoff", async ({ page }) => {
  const draw = await saveMatchdayDraw();
  let releaseDestination!: () => void;
  const destinationGate = new Promise<void>(resolve => { releaseDestination = resolve; });
  try {
    await page.clock.install();
    await page.route("https://crests.football-data.org/**", () => new Promise(() => {}));
    await page.route("**/m/**", async route => {
      if (new URL(route.request().url()).pathname === `/m/${draw.token}`) await destinationGate;
      await route.continue();
    });
    await page.goto(`/m/${draw.token}/reveal`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-intro");
    for (let time = 0; time < 19500; time += 100) await page.clock.runFor(100);
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-outro");
    await expect(page.locator('[data-stage="brand-outro"]')).toBeVisible();
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
    await expect(page.locator(".fixture")).toHaveCount(0);
    releaseDestination();
    await page.waitForURL(`/m/${draw.token}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".fixture-heading")).toHaveText("Arsenal v Chelsea");
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await page.goto(`/m/${draw.token}/reveal`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-intro");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForURL(`/m/${draw.token}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".ticket-brand")).toHaveCount(0);
    await page.clock.runFor(20000);
    await expect(page.locator(".fixture-heading")).toHaveText("Arsenal v Chelsea");
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  } finally { releaseDestination(); await draw.cleanup(); }
});

test("home errors never start a brand handoff and repeated success submissions create only one draw", async ({ page }) => {
  const draw = await saveMatchdayDraw();
  let requests = 0;
  try {
    await page.route("**/api/draw", async route => {
      requests++;
      if (requests === 1) await route.fulfill({ status: 503, json: { error: "The fixture service is temporarily unavailable." } });
      else await route.fulfill({ status: 201, json: { shareToken: draw.token } });
    });
    await page.goto("/");
    await selectTripDates(page, "2026-11-27", "2026-11-29");
    await page.getByRole("button", { name: "Draw my match" }).click();
    await expect(page.locator("#draw-error")).toHaveText("The fixture service is temporarily unavailable.");
    await expect(page.locator("form")).toHaveAttribute("data-state", "error");
    await expect(page.locator(".ticket-brand")).toHaveCount(0);
    await page.getByRole("button", { name: "Draw my match" }).click();
    await page.locator("form").dispatchEvent("submit");
    await page.waitForURL(`/m/${draw.token}/reveal`);
    expect(requests).toBe(2);
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-intro");
  } finally { await draw.cleanup(); }
});

test("320px long names remain contained through slower cards and unmount cancels the sequence", async ({ page }, info) => {
  const draw = await saveMatchdayDraw({ longNames: true, country: "Bosnia and Herzegovina" });
  try {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.clock.install();
    await page.goto(`/m/${draw.token}/reveal`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-intro");
    await page.clock.runFor(3000);
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "country");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath("long-country-320.png"), fullPage: true, animations: "disabled" });
    await page.clock.runFor(10500);
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "clubs");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath("long-clubs-320.png"), fullPage: true, animations: "disabled" });
    await page.getByRole("link", { name: "Matchbound home" }).click();
    await page.waitForURL("/");
    await page.clock.runFor(25000);
    await expect(page.getByRole("heading", { name: "Your next football weekend." })).toBeVisible();
    await expect(page.locator(".ticket-brand")).toHaveCount(0);
  } finally { await draw.cleanup(); }
});
