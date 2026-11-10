import "dotenv/config";
import {expect,test} from "@playwright/test";
import {and,eq} from "drizzle-orm";
import {randomBytes} from "node:crypto";
import {createDb} from "../src/db/client";
import {competitions,draws,fixtures,venues} from "../src/db/schema";
import catalogue from "../data/beer-catalogue.json";
import type {DrawResultSnapshot} from "../src/domain/result";
test.skip(!process.env.ARTWORK_BASE_URL,"Use the explicit artwork smoke config");
for(const id of ["augustiner-2","krombacher-1"])test(id+" uses published exact product art with credits and fallback",async({page},info)=>{
 const db=createDb();const token=randomBytes(24).toString("base64url");
 const [row]=await db.select({fixture:fixtures,venue:venues,competition:competitions}).from(fixtures).innerJoin(venues,eq(fixtures.venueId,venues.id)).innerJoin(competitions,eq(fixtures.competitionId,competitions.id)).where(and(eq(venues.country,"Germany"),eq(venues.reviewed,true),eq(fixtures.status,"confirmed"))).limit(1);
 expect(row).toBeTruthy();const product=catalogue.products.find(p=>p.id===id)!;const brewery=catalogue.breweries.find(b=>b.id===product.breweryId)!;const brand=brewery.name+" "+product.name;
 const result:DrawResultSnapshot={country:row.venue.country,city:row.venue.city,stadium:row.venue.stadium,competition:row.competition.name,homeTeam:row.fixture.homeTeam,awayTeam:row.fixture.awayTeam,kickoffAt:row.fixture.kickoffAt.toISOString(),kickoffDate:row.fixture.kickoffDate,timezone:row.venue.timezone,officialTicketUrl:row.fixture.officialTicketUrl,beerSignals:{countryBrand:{countryName:"Germany",brandName:brand,productId:id,breweryName:brewery.name,sourceUrl:product.sourceUrl}}};
 await db.insert(draws).values({shareToken:token,fixtureId:row.fixture.id,resultSnapshot:result,tripStartDate:result.kickoffDate,tripEndDate:result.kickoffDate,expiresAt:new Date(Date.now()+3600000)});
 try{
  await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/m/"+token);
  await page.getByRole("button",{name:"Reveal my beer"}).click();const image=page.getByRole("img",{name:brand+" product photo"});
  await expect(image).toHaveAttribute("src",new RegExp("/storage/v1/object/public/matchbound-creatives/journal/beer-art-"+id+"-v1/"));
  await expect.poll(()=>image.evaluate(i=>(i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByText("Photo source",{exact:true}).click();await expect(page.locator("details.beer-art-credit")).toContainText("CC BY-SA 3.0");await expect(page.locator("details.beer-art-credit")).toContainText("Historical packaging");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath(id+".png"),fullPage:true,animations:"disabled"});
  await page.reload();await expect(page.locator(".beer-ticket h2")).toHaveText(brand);
  await page.route("**/storage/v1/object/public/matchbound-creatives/journal/beer-art-*/**",route=>route.abort());await page.reload();
  await expect(page.getByRole("img",{name:brand+" product photo"})).toHaveCount(0);await expect(page.locator(".beer-ticket .beer-seal")).toBeVisible();await expect(page.locator(".beer-ticket h2")).toHaveText(brand);
 }finally{await db.delete(draws).where(eq(draws.shareToken,token));}
});
