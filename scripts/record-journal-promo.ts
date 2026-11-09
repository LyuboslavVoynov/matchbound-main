import "dotenv/config";
import { chromium, type Page } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { mkdir } from "node:fs/promises";
import { createDb } from "../src/db/client";
import { draws } from "../src/db/schema";
import type { DrawResultSnapshot } from "../src/domain/result";

// Records a local illustrative draw; the temporary database row is always removed.
const output = process.env.PROMO_OUTPUT_DIR ?? "/tmp/matchbound-promo";
const origin = process.env.PROMO_ORIGIN ?? "http://127.0.0.1:3012";
const token = randomBytes(24).toString("base64url");
const db = createDb();
const result: DrawResultSnapshot = {
  country:"Portugal", city:"Porto", competition:"Primeira Liga", stadium:"Estádio do Dragão",homeTeam:"FC Porto",awayTeam:"Benfica",
  kickoffDate:"2026-11-28",kickoffAt:"2026-11-28T18:00:00Z",timezone:"Europe/Lisbon",officialTicketUrl:null,
  visualIdentity:{competitionEmblemUrl:"https://crests.football-data.org/PPL.png",homeTeamCrestUrl:"https://crests.football-data.org/503.png",awayTeamCrestUrl:"https://crests.football-data.org/1903.png"},
};
async function move(page:Page,selector:string){const box=await page.locator(selector).first().boundingBox();if(box)await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5,{steps:24});}
async function main(){
  await mkdir(output,{recursive:true});
  const fixture=await db.query.fixtures.findFirst();if(!fixture)throw Error("A fixture is required for temporary preview storage.");
  await db.insert(draws).values({shareToken:token,fixtureId:fixture.id,tripStartDate:"2026-11-27",tripEndDate:"2026-11-29",expiresAt:new Date(Date.now()+3600000),resultSnapshot:result});
  const browser=await chromium.launch();
  try{
    // Warm routes and local imagery before the recording to avoid compilation stalls.
    const warm=await browser.newPage();
    await warm.goto(`${origin}/design/weekend-journal`,{waitUntil:"networkidle"});
    await warm.goto(`${origin}/m/${token}/reveal`,{waitUntil:"networkidle"});
    await warm.goto(`${origin}/m/${token}`,{waitUntil:"networkidle"});await warm.close();
    const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,recordVideo:{dir:`${output}/raw`,size:{width:1440,height:900}},reducedMotion:"no-preference"});
    const decoratePage = async (page: Page) => page.evaluate(()=>{
        const style=document.createElement("style");style.textContent=`nextjs-portal{display:none!important}.promo-label{position:fixed;right:18px;bottom:14px;z-index:1000;background:#f4f2e9e8;color:#102b23;padding:7px 11px;border:1px solid #102b2330;border-radius:20px;font:10px Arial,sans-serif;letter-spacing:.5px;pointer-events:none}.promo-cursor{position:fixed;z-index:1001;width:22px;height:22px;border:1.5px solid #5d783c;border-radius:50%;background:#d8ff5b55;transform:translate(-50%,-50%);pointer-events:none;transition:opacity .25s;left:-30px;top:-30px}`;document.head.append(style);
        const label=document.createElement("div");label.className="promo-label";label.textContent="CONCEPT PREVIEW · EXAMPLE FIXTURE";document.body.append(label);
        const cursor=document.createElement("div");cursor.className="promo-cursor";document.body.append(cursor);document.addEventListener("mousemove",event=>{cursor.style.left=event.clientX+"px";cursor.style.top=event.clientY+"px"});
    });
    const page=await context.newPage();const video=page.video()!;const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
    await page.route("**/api/draw",async route=>{await new Promise(resolve=>setTimeout(resolve,650));await route.fulfill({status:201,json:{shareToken:token}})});
    await page.goto(origin,{waitUntil:"networkidle"});await decoratePage(page);await page.waitForTimeout(3200);
    await move(page,'button[aria-label="Trip starts"]');
    await page.getByRole("button",{name:"Trip starts",exact:true}).click();await page.waitForTimeout(1300);
    const desired="November 2026";
    while(await page.locator("#calendar-month").innerText()!==desired)await page.getByRole("button",{name:"Next month",exact:true}).click();
    await move(page,'[data-calendar-date="2026-11-27"]');await page.waitForTimeout(650);await page.locator('[data-calendar-date="2026-11-27"]').click();await page.waitForTimeout(900);
    await page.getByRole("button",{name:"Trip ends",exact:true}).click();await page.waitForTimeout(700);await move(page,'[data-calendar-date="2026-11-29"]');await page.waitForTimeout(650);await page.locator('[data-calendar-date="2026-11-29"]').click();await page.waitForTimeout(1400);
    await move(page,'.draw-form button[type="submit"], .draw-form>.button');await page.waitForTimeout(400);await page.getByRole("button",{name:"Draw my match"}).click();
    await page.waitForURL(`**/m/${token}/reveal`);await decoratePage(page);await page.mouse.move(1400,860,{steps:12});await page.evaluate(()=>{document.querySelectorAll<HTMLElement>('.promo-cursor').forEach(el=>{el.style.opacity="0"})});
    const seen=new Set<string>();
    while(new URL(page.url()).pathname!==`/m/${token}`){const stage=await page.locator("main").getAttribute("data-active-stage").catch(()=>null);if(stage)seen.add(stage);await page.waitForTimeout(100);}
    await decoratePage(page);await page.evaluate(()=>document.querySelectorAll<HTMLElement>(".promo-cursor").forEach(el=>el.style.opacity="0"));
    await page.locator(".result-handoff-overlay").waitFor({state:"detached"});await page.waitForTimeout(4800);
    await page.screenshot({path:`${output}/matchbound-promo-final.png`,fullPage:true});
    await page.evaluate(()=>window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"}));await page.waitForTimeout(1600);await page.evaluate(()=>window.scrollTo({top:0,behavior:"smooth"}));await page.waitForTimeout(1600);
    await context.close();await video.saveAs(`${output}/matchbound-weekend-journal-preview.webm`);
    console.log(JSON.stringify({video:`${output}/matchbound-weekend-journal-preview.webm`,stages:[...seen],errors}));
  }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{await db.delete(draws).where(eq(draws.shareToken,token));process.exit(process.exitCode??0)});
