import "dotenv/config";
import {expect,test} from "@playwright/test";
import {and,eq,gte} from "drizzle-orm";
import {randomBytes} from "node:crypto";
import {createDb} from "../src/db/client";
import {competitions,draws,fixtures,venues} from "../src/db/schema";
import {findBeerSignalsForFixture} from "../src/db/beer-signal-repository";
import {drawVisualIdentity} from "../src/domain/visual-identity";
import type {DrawResultSnapshot} from "../src/domain/result";
test.skip(!process.env.CONTENT_BASE_URL,"Explicit deployment target required");
for(const target of [{country:"Germany",city:"Hamburg",slug:"hamburg"},{country:"Germany",city:"Bremen",slug:"bremen"},{country:"Germany",city:"Berlin",slug:"berlin"}]){
 test(target.city+" content batch resolves exact photos and country beer",async({page},info)=>{
  const db=createDb();const token=randomBytes(24).toString("base64url");
  const [row]=await db.select({fixture:fixtures,venue:venues,competition:competitions}).from(fixtures).innerJoin(venues,eq(fixtures.venueId,venues.id)).innerJoin(competitions,eq(fixtures.competitionId,competitions.id)).where(and(eq(venues.country,target.country),eq(venues.city,target.city),eq(venues.reviewed,true),eq(fixtures.status,"confirmed"),gte(fixtures.kickoffDate,new Date().toISOString().slice(0,10)))).limit(1);
  expect(row).toBeTruthy();const beerSignals=await findBeerSignalsForFixture(db,target.country,target.city);
  const result:DrawResultSnapshot={country:row.venue.country,city:row.venue.city,stadium:row.venue.stadium,competition:row.competition.name,homeTeam:row.fixture.homeTeam,awayTeam:row.fixture.awayTeam,kickoffAt:row.fixture.kickoffAt.toISOString(),kickoffDate:row.fixture.kickoffDate,timezone:row.venue.timezone,officialTicketUrl:row.fixture.officialTicketUrl,beerSignals,visualIdentity:drawVisualIdentity({competitionEmblemUrl:row.competition.emblemUrl,countryFlagUrl:row.competition.areaFlagUrl,homeTeamCrestUrl:row.fixture.homeTeamCrestUrl,awayTeamCrestUrl:row.fixture.awayTeamCrestUrl})};
  await db.insert(draws).values({shareToken:token,fixtureId:row.fixture.id,resultSnapshot:result,tripStartDate:result.kickoffDate,tripEndDate:result.kickoffDate,expiresAt:new Date(Date.now()+3600000)});
  try{
   {
    await page.clock.install();await page.goto("/m/"+token+"/reveal",{waitUntil:"networkidle"});
    for(let i=0;i<85;i++){if(await page.locator("main").getAttribute("data-active-stage")==="city")break;await page.clock.runFor(100);}
    const cityImage=page.locator(".journal-live-photo img");await expect(cityImage).toHaveAttribute("src",new RegExp("bl1-"+target.slug+"-city-v1"));
    await expect.poll(()=>cityImage.evaluate(i=>(i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.screenshot({path:info.outputPath(target.slug+"-city-reveal.png"),fullPage:true,animations:"disabled"});
   }
   await page.goto("/m/"+token);const photo=page.locator(".fixture-backdrop img");
   await expect(photo).toHaveAttribute("src",new RegExp("bl1-"+target.slug+"-stadium-v1"));
   await expect.poll(()=>photo.evaluate(i=>(i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
   await page.getByText("Photo credit",{exact:true}).click();await expect(page.locator(".fixture-photo-credit")).toContainText(/CC BY|CC0/);
   {
    expect(beerSignals?.countryBrand?.productId).toMatch(/^(augustiner|paulaner|weihenstephaner|erdinger|krombacher)-/);
    await page.emulateMedia({reducedMotion:"reduce"});await page.getByRole("button",{name:"Pour my pick"}).click();
    await expect(page.locator(".beer-ticket h2")).toHaveText(beerSignals!.countryBrand!.brandName);
    const abv=beerSignals!.countryBrand!.abvBasisPoints;
    if(abv!==undefined)await expect(page.locator(".beer-ticket")).toContainText(abv/100+"% ABV");
    else await expect(page.locator(".beer-ticket")).not.toContainText("% ABV");

    await page.reload();await expect(page.locator(".beer-ticket")).toHaveAttribute("data-beer-state","revealed");
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:info.outputPath(target.city+"-published.png"),fullPage:true,animations:"disabled"});
  }finally{await db.delete(draws).where(eq(draws.shareToken,token));}
 });
}
