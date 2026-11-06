import "dotenv/config";
import { expect, test } from "@playwright/test";
import { saveMatchdayDraw } from "./helpers/saved-draw";

async function finishSequence(page: import("@playwright/test").Page) {
  for (let time = 0; time < 19500; time += 100) await page.clock.runFor(100);
}

test("the same settled brand survives slow navigation and lifts only when the result mounts", async ({ page }, info) => {
  const draw = await saveMatchdayDraw();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  try {
    await page.clock.install();
    await page.route("**/m/**", async route => {
      if (new URL(route.request().url()).pathname === `/m/${draw.token}`) await gate;
      await route.continue();
    });
    await page.goto(`/m/${draw.token}/reveal`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-intro");
    await finishSequence(page);
    const overlay = page.locator(".result-handoff-overlay");
    await expect(page.locator(".route-surface")).toHaveAttribute("data-handoff-phase", "covered");
    await expect(overlay).toBeVisible();
    const original = await overlay.elementHandle();
    expect(await overlay.locator(".ticket-brandword").evaluate(el => el.getAnimations().length)).toBe(0);
    await page.clock.runFor(5000);
    await expect(page.locator(".route-surface")).toHaveAttribute("data-handoff-phase", "covered");
    release();
    await page.waitForURL(`/m/${draw.token}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".route-surface")).toHaveAttribute("data-handoff-phase", "revealing");
    expect(await original!.evaluate(el => el.isConnected)).toBe(true);
    await expect(page.locator(".result-locked")).toHaveText("Fixture locked");
    await overlay.evaluate(el => {
      const animation = el.getAnimations()[0];
      animation.pause(); animation.currentTime = 350;
    });
    expect(await overlay.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(-20);
    await page.screenshot({ path: info.outputPath("seamless-mid-wipe.png"), fullPage: false, animations: "allow" });
    await overlay.evaluate(el => el.getAnimations().forEach(animation => animation.finish()));
    await expect(overlay).toHaveCount(0);
    await expect(page.locator(".route-surface")).not.toHaveAttribute("inert");
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("[data-handoff-heading]")).toBeFocused();
    await expect(page.locator("[data-handoff-heading]")).toHaveCSS("outline-color", "rgb(82, 117, 47)");
    await expect(page.getByRole("button", { name: "Copy trip link" })).toBeVisible();
    await page.screenshot({ path: info.outputPath("result-after-wipe.png"), fullPage: true });
    await page.reload();
    await expect(overlay).toHaveCount(0);
    await expect(page.locator(".route-surface")).toHaveAttribute("data-handoff-phase", "idle");
  } finally { release(); await draw.cleanup(); }
});

test("missing destination and a reduced-motion change both release the handoff", async ({ page }) => {
  for (const fallback of ["missing", "reduce"] as const) {
    const draw = await saveMatchdayDraw();
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    try {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.clock.install();
      await page.route("**/m/**", async route => {
        if (new URL(route.request().url()).pathname === `/m/${draw.token}`) await gate;
        await route.continue();
      });
      await page.goto(`/m/${draw.token}/reveal`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-intro");
      await finishSequence(page);
      await expect(page.locator(".result-handoff-overlay")).toBeVisible();
      if (fallback === "missing") await draw.cleanup();
      else {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
        await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
      }
      release();
      await page.waitForURL(`/m/${draw.token}`, { waitUntil: "domcontentloaded" });
      if (fallback === "missing") await expect(page.getByRole("heading", { name: "This trip link is not here." })).toBeVisible();
      else await expect(page.locator(".fixture-heading")).toHaveText("Arsenal v Chelsea");
      await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
      await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
      await page.unroute("**/m/**");
    } finally { release(); await draw.cleanup(); }
  }
});

test("back navigation cancels an in-flight handoff without carrying its scroll lock home", async ({ page }) => {
  const draw = await saveMatchdayDraw();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  try {
    await page.route("**/api/draw", route => route.fulfill({ status: 201, json: { shareToken: draw.token } }));
    await page.route("**/m/**", async route => {
      if (new URL(route.request().url()).pathname === `/m/${draw.token}`) await gate;
      await route.continue();
    });
    await page.clock.install();
    await page.goto("/");
    await page.getByLabel("Trip starts").fill("2026-11-27");
    await page.getByLabel("Trip ends").fill("2026-11-29");
    await page.getByRole("button", { name: "Draw my match" }).click();
    await expect(page.locator("form")).toHaveAttribute("data-state", "success");
    await page.clock.runFor(300);
    await page.waitForURL(`/m/${draw.token}/reveal`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveAttribute("data-active-stage", "brand-intro");
    await finishSequence(page);
    await expect(page.locator(".result-handoff-overlay")).toBeVisible();
    await page.goBack({ waitUntil: "domcontentloaded" });
    await page.waitForURL("/");
    await expect(page.getByRole("heading", { name: "Your next football weekend." })).toBeVisible();
    await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    release();
    await page.clock.runFor(30000);
    await expect(page.getByRole("heading", { name: "Your next football weekend." })).toBeVisible();
  } finally { release(); await draw.cleanup(); }
});
