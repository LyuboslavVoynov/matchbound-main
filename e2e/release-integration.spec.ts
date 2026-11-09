import "dotenv/config";
import {expect,test} from "@playwright/test";
import {and,eq} from "drizzle-orm";
import {randomBytes} from "node:crypto";
import {createDb} from "../src/db/client";
import {fixtures,venues,competitions,draws} from "../src/db/schema";
import {findSharedDraw} from "../src/db/draw-repository";
import {drawVisualIdentity} from "../src/domain/visual-identity";
import type {DrawResultSnapshot} from "../src/domain/result";

test("real non-UK draw retains the merged preference through the result",async({page})=>{
 const db=createDb();let token:string|undefined;
 try{
  const response=await page.request.post("/api/draw",{data:{startDate:"2026-11-27",endDate:"2026-11-29",includeUK:false}});
  expect(response.status()).toBe(201);token=(await response.json()).shareToken;
  const saved=await findSharedDraw(db,token!);expect(saved).toBeTruthy();expect(["England","Wales","Scotland","Northern Ireland","United Kingdom"]).not.toContain(saved.resultSnapshot.country);
  await page.goto("/m/"+token);await expect(page.locator(".country")).toContainText(saved.resultSnapshot.country);
  await expect(page.getByRole("button",{name:"Copy link",exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{if(token)await db.delete(draws).where(eq(draws.shareToken,token));}
});

test("published Funchal imagery survives reveal-to-result handoff",async({page},info)=>{
 const db=createDb();const token=randomBytes(24).toString("base64url");
 const [row]=await db.select({fixture:fixtures,venue:venues,competition:competitions}).from(fixtures).innerJoin(venues,eq(fixtures.venueId,venues.id)).innerJoin(competitions,eq(fixtures.competitionId,competitions.id)).where(and(eq(venues.country,"Portugal"),eq(venues.city,"Funchal"),eq(venues.stadium,"Estádio da Madeira"),eq(venues.reviewed,true),eq(fixtures.status,"confirmed"))).limit(1);
 expect(row).toBeTruthy();
 const result:DrawResultSnapshot={country:row.venue.country,city:row.venue.city,stadium:row.venue.stadium,competition:row.competition.name,homeTeam:row.fixture.homeTeam,awayTeam:row.fixture.awayTeam,kickoffAt:row.fixture.kickoffAt.toISOString(),kickoffDate:row.fixture.kickoffDate,timezone:row.venue.timezone,officialTicketUrl:row.fixture.officialTicketUrl,visualIdentity:drawVisualIdentity({competitionEmblemUrl:row.competition.emblemUrl,countryFlagUrl:row.competition.areaFlagUrl,homeTeamCrestUrl:row.fixture.homeTeamCrestUrl,awayTeamCrestUrl:row.fixture.awayTeamCrestUrl})};
 await db.insert(draws).values({shareToken:token,fixtureId:row.fixture.id,resultSnapshot:result,tripStartDate:result.kickoffDate,tripEndDate:result.kickoffDate,expiresAt:new Date(Date.now()+3600000)});
 try{
  await page.clock.install();await page.goto("/m/"+token+"/reveal",{waitUntil:"networkidle"});
  const seen=new Set<string>();for(let i=0;i<270;i++){if(new URL(page.url()).pathname==="/m/"+token)break;const stage=await page.locator("main").getAttribute("data-active-stage");if(stage)seen.add(stage);await page.clock.runFor(100);}
  expect([...seen]).toEqual(["brand-intro","country","city","competition","stadium","clubs","brand-outro"]);
  await page.waitForURL("**/m/"+token);await page.clock.runFor(1000);await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
  await expect(page.locator(".fixture-backdrop img")).toHaveAttribute("src",new RegExp("/storage/v1/object/public/matchbound-creatives/"));
  expect(await page.locator(".fixture-backdrop img").evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(".ledger-empty")).toBeVisible();await expect(page.locator(".beer-ticket")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath("funchal-integrated-result.png"),fullPage:true,animations:"disabled"});
 }finally{await db.delete(draws).where(eq(draws.shareToken,token));}
});
