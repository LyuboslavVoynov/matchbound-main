import { expect, test } from "@playwright/test";
import { selectTripDates } from "./helpers/trip-dates";
test("compact switch submits both scopes, remains keyboard operable and retains selection after no matches",async({page})=>{
 const requests:unknown[]=[];
 await page.route("**/api/draw",async route=>{requests.push(route.request().postDataJSON());await route.fulfill({status:404,json:{error:"No eligible confirmed fixtures outside the UK were found for these dates. Try different dates or include UK matches."}})});
 await page.goto("/");const toggle=page.getByRole("switch",{name:"Include UK matches"});await expect(toggle).toBeChecked();
 await selectTripDates(page,"2026-11-27","2026-11-29");
 await toggle.focus();await page.keyboard.press("Space");await expect(toggle).not.toBeChecked();await expect(page.getByText("Only matches outside the UK.")).toBeVisible();
 await page.getByRole("button",{name:"Draw my match"}).click();await expect(page.locator("#draw-error")).toContainText("outside the UK");
 expect(requests[0]).toEqual({startDate:"2026-11-27",endDate:"2026-11-29",includeUK:false});await expect(toggle).not.toBeChecked();
 await toggle.check();await page.getByRole("button",{name:"Draw my match"}).click();await expect.poll(()=>requests.length).toBe(2);expect(requests[1]).toMatchObject({includeUK:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
