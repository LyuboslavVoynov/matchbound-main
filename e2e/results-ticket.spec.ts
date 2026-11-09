import {expect,test} from "@playwright/test";
import sample from "../src/data/results-ticket-example.json";
test("ledger preserves recorded score order and ticket reveal survives a reload",async({page},info)=>{
 await page.goto("/design/results-ticket");
 const rows=page.locator(".ledger-meetings>li");await expect(rows).toHaveCount(sample.headToHead.meetings.length);
 for(let i=0;i<sample.headToHead.meetings.length;i++){const m=sample.headToHead.meetings[i];await expect(rows.nth(i).locator(".ledger-score")).toHaveText(m.homeScore+"–"+m.awayScore);await expect(rows.nth(i).locator(".scorecard-opponents span").first()).toContainText(m.homeTeam);await expect(rows.nth(i).locator(".scorecard-opponents span").last()).toContainText(m.awayTeam);}
 await expect(page.getByText("Goal difference",{exact:true})).toHaveCount(0);
 expect(await page.locator(".ledger-meetings").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length)).toBe(2);
 await expect(page.getByRole("button",{name:"Copy link",exact:true})).toBeVisible();
 await expect(page.getByRole("link",{name:"Share on WhatsApp"})).toHaveText("Share on WhatsApp");
 expect(await page.locator(".fixture-backdrop img").evaluate((img)=> (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 expect(await page.locator(".matchuptop h2").evaluate(el=>getComputedStyle(el).fontFamily)).toContain("Inter");
 const brand=sample.beerSignals.countryBrand.brandName;
 await expect(page.getByRole("heading",{name:brand,exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Reveal my beer"}).click();await expect(page.locator(".beer-ticket")).toHaveAttribute("data-beer-state","opening");
 await expect(page.getByRole("heading",{name:brand,exact:true})).toBeVisible();await expect(page.getByRole("button",{name:"Reveal my beer"})).toHaveCount(0);
 await page.reload();await expect(page.locator(".beer-ticket")).toHaveAttribute("data-beer-state","revealed");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath("ledger-ticket-revealed.png"),fullPage:true,animations:"disabled"});
});
test("reduced motion and denied storage still allow the beer reveal",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.addInitScript(()=>{Object.defineProperty(Storage.prototype,"getItem",{value:()=>{throw Error("Unavailable")}});Object.defineProperty(Storage.prototype,"setItem",{value:()=>{throw Error("Unavailable")}})});
 await page.goto("/design/results-ticket?beer=Berliner%20Pilsner");await page.getByRole("button",{name:"Reveal my beer"}).click();
 await expect(page.locator(".beer-ticket")).toHaveAttribute("data-beer-state","revealed");await expect(page.getByRole("img",{name:"Berliner Pilsner logo"})).toBeVisible();
});
test("missing meeting and beer data show an honest empty ledger without a ticket",async({page})=>{
 await page.goto("/design/results-ticket?empty=1");await expect(page.locator(".ledger-empty")).toBeVisible();await expect(page.locator(".ledger-meetings,.ledger-summary,.beer-ticket")).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
