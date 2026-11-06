import "dotenv/config";
import { expect, test } from "@playwright/test";
import { saveMatchdayDraw } from "./helpers/saved-draw";

test("beer has a substantial panel and sharing stays compact for every data variant", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const beer of ["brand", "price", "both", "none"] as const) {
    const draw = await saveMatchdayDraw({ beer });
    try {
      await page.goto(`/m/${draw.token}`);
      await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
      if (beer === "none") await expect(page.locator(".beer-panel")).toHaveCount(0);
      else {
        await expect(page.getByRole("region", { name: "Beer details" })).toBeVisible();
        await expect(page.locator(".beer-name")).toHaveCount(beer === "price" ? 0 : 1);
        await expect(page.locator(".beer-price strong")).toHaveCount(beer === "brand" ? 0 : 1);
        if (beer !== "price") {
          await expect(page.locator(".beer-name")).toHaveText("London Pride");
          expect(parseFloat(await page.locator(".beer-name").evaluate(el => getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(23);
        }
        if (beer !== "brand") await expect(page.getByText("City average, not a stadium price.")).toBeVisible();
      }
      const copy = await page.getByRole("button", { name: "Copy trip link" }).boundingBox();
      const ticket = await page.getByRole("link", { name: "Get tickets" }).boundingBox();
      expect(copy!.height).toBeGreaterThanOrEqual(44);
      expect(copy!.width).toBeLessThan(ticket!.width * .7);
      await expect(page.getByRole("link", { name: "Share on WhatsApp" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath(`beer-${beer}-320.png`), fullPage: true });
    } finally { await draw.cleanup(); }
  }
});

test("copy success and failure are announced and WhatsApp encodes the same canonical link", async ({ page }) => {
  const draw = await saveMatchdayDraw();
  try {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => {
        const state = window as Window & { copiedTrip?: string; failCopy?: boolean };
        if (state.failCopy) throw new Error("Clipboard unavailable");
        state.copiedTrip = value;
      } } });
    });
    await page.goto(`/m/${draw.token}?utm_source=test#fixture`);
    const canonical = `${new URL(page.url()).origin}/m/${draw.token}`;
    await page.getByRole("button", { name: "Copy trip link" }).click();
    await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();
    await expect(page.locator(".trip-sharing [role=status]")).toHaveText("Trip link copied.");
    expect(await page.evaluate(() => (window as Window & { copiedTrip?: string }).copiedTrip)).toBe(canonical);
    await page.evaluate(() => { (window as Window & { failCopy?: boolean }).failCopy = true; });
    await page.getByRole("button", { name: "Link copied" }).click();
    await expect(page.locator(".trip-sharing [role=alert]")).toContainText("Couldn’t copy the link");
    const share = page.getByRole("link", { name: "Share on WhatsApp" });
    const href = (await share.getAttribute("href"))!;
    const url = new URL(href);
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toBe(`Arsenal v Chelsea — London. Our next football weekend.\n${canonical}`);
    await expect(share).toHaveAttribute("target", "_blank");
    await expect(share).toHaveAttribute("rel", "noreferrer");
    // Exercise the click without opening WhatsApp or sending data to it.
    await share.evaluate(anchor => anchor.addEventListener("click", event => {
      event.preventDefault();
      (window as Window & { selectedShare?: string }).selectedShare = (anchor as HTMLAnchorElement).href;
    }));
    await share.click();
    expect(await page.evaluate(() => (window as Window & { selectedShare?: string }).selectedShare)).toBe(href);
  } finally { await draw.cleanup(); }
});
