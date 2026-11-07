import type { Page } from "@playwright/test";

export async function selectTripDate(page: Page, field: "Trip starts" | "Trip ends", date: string) {
  await page.getByRole("button", { name: field, exact: true }).click();
  const desired = new Date(`${date}T12:00:00Z`);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(desired);
  for (let attempt = 0; attempt < 36; attempt++) {
    const current = await page.locator("#calendar-month").innerText();
    if (current === month) { await page.locator(`[data-calendar-date="${date}"]`).click(); return; }
    await page.getByRole("button", { name: new Date(`1 ${current}`) < desired ? "Next month" : "Previous month", exact: true }).click();
  }
  throw new Error(`Could not navigate to ${month}`);
}
export async function selectTripDates(page: Page, start: string, end: string) {
  await selectTripDate(page, "Trip starts", start);
  await selectTripDate(page, "Trip ends", end);
}
