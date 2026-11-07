import { expect, test } from "@playwright/test";
import { selectTripDate, selectTripDates } from "./helpers/trip-dates";

test("inline range supports cross-month limits, editing, same-day trips and keyboard navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("grid")).toHaveCount(0);
  await page.getByRole("button", { name: "Draw my match" }).click();
  await expect(page.locator("#draw-error")).toHaveText("Choose both trip dates to continue.");
  await expect(page.getByRole("button", { name: "Trip starts", exact: true })).toBeFocused();
  await selectTripDate(page, "Trip starts", "2026-11-27");
  const fourth = page.locator('[data-calendar-date="2026-12-04"]');
  await expect(fourth).toHaveAttribute("aria-disabled", "true");
  await fourth.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Trip ends", exact: true })).toContainText("Choose a date");
  await page.locator('[data-calendar-date="2026-12-03"]').click();
  await expect(page.locator("#calendar-selection")).toContainText("7 calendar days");
  await expect(page.getByRole("grid")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Trip ends", exact: true })).toBeFocused();
  await expect(page.locator('[role="gridcell"][aria-selected="true"]')).toHaveCount(4); // December view includes the selected Nov 30–Dec 3.
  await page.getByRole("button", { name: "Trip ends", exact: true }).click();
  await page.locator('[data-calendar-date="2026-12-03"]').focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-calendar-date="2026-12-02"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#calendar-selection")).toContainText("6 calendar days");
  await page.getByRole("button", { name: "Clear dates" }).click();
  await selectTripDates(page, "2026-12-31", "2026-12-31");
  await expect(page.locator("#calendar-selection")).toContainText("1 calendar day");
  await page.getByRole("button", { name: "Trip starts", exact: true }).click();
  await page.locator('[data-calendar-date="2026-12-31"]').focus();
  await page.keyboard.press("PageDown");
  await expect(page.locator("#calendar-month")).toHaveText("January 2027");
  await expect(page.locator('[data-calendar-date="2027-01-31"]')).toBeFocused();
});

test("phone and desktop layouts preserve validation and the existing draw submission", async ({ page }) => {
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto("/");
    await selectTripDates(page, "2026-11-27", "2026-11-29");
    await expect(page.locator("#calendar-selection")).toContainText("3 calendar days");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/inline-calendar-${width}.png`, fullPage: true });
  }
  let payload: unknown;
  await page.route("**/api/draw", async route => { payload = route.request().postDataJSON(); await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: "No eligible confirmed fixtures were found for these dates." }) }); });
  await page.getByRole("button", { name: "Draw my match" }).click();
  await expect(page.locator("#draw-error")).toContainText("No eligible confirmed fixtures");
  expect(payload).toEqual({ startDate: "2026-11-27", endDate: "2026-11-29" });
  await page.getByRole("button", { name: "Trip starts", exact: true }).click();
  await page.locator('[data-calendar-date="2026-11-26"]').click();
  await expect(page.locator("#draw-error")).toHaveCount(0);
});
