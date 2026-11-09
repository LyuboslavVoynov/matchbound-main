import "dotenv/config";
import {expect,test} from "@playwright/test";
import {and,eq} from "drizzle-orm";
import {randomBytes} from "node:crypto";
import {createDb} from "../src/db/client";
import {fixtures,venues,competitions,draws} from "../src/db/schema";
import {findBeerSignalsForFixture} from "../src/db/beer-signal-repository";
import type {DrawResultSnapshot} from "../src/domain/result";

test("saved catalogue beer reveals its source and survives reload",async({page},info)=>{
 const db=createDb();const token=randomBytes(24).toString("base64url");
 const [row]=await db.select({fixture:fixtures,venue:venues,competition:competitions}).from(fixtures).innerJoin(venues,eq(fixtures.venueId,venues.id)).innerJoin(competitions,eq(fixtures.competitionId,competitions.id)).where(and(eq(venues.country,"Germany"),eq(venues.reviewed,true),eq(fixtures.status,"confirmed"))).limit(1);
 expect(row).toBeTruthy();
 const beerSignals=await findBeerSignalsForFixture(db,row.venue.country,row.venue.city);
 expect(beerSignals?.countryBrand?.productId).toBeTruthy();
 const result:DrawResultSnapshot={country:row.venue.country,city:row.venue.city,stadium:row.venue.stadium,competition:row.competition.name,homeTeam:row.fixture.homeTeam,awayTeam:row.fixture.awayTeam,kickoffAt:row.fixture.kickoffAt.toISOString(),kickoffDate:row.fixture.kickoffDate,timezone:row.venue.timezone,officialTicketUrl:row.fixture.officialTicketUrl,beerSignals};
 await db.insert(draws).values({shareToken:token,fixtureId:row.fixture.id,resultSnapshot:result,tripStartDate:result.kickoffDate,tripEndDate:result.kickoffDate,expiresAt:new Date(Date.now()+3600000)});
 try{
  await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/m/"+token);
  await page.getByRole("button",{name:"Reveal my beer"}).click();
  const ticket=page.locator(".beer-ticket");await expect(ticket).toHaveAttribute("data-beer-state","revealed");
  await expect(ticket.getByRole("heading")).toHaveText(beerSignals!.countryBrand!.brandName);
  await expect(ticket.getByRole("link",{name:"Brewery source"})).toHaveAttribute("href",beerSignals!.countryBrand!.sourceUrl!);
  if(beerSignals!.countryBrand!.abvBasisPoints!==undefined)await expect(ticket).toContainText(`${beerSignals!.countryBrand!.abvBasisPoints!/100}% ABV`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath("catalogue-ticket.png"),fullPage:true,animations:"disabled"});
  await page.reload();await expect(ticket).toHaveAttribute("data-beer-state","revealed");await expect(ticket.getByRole("heading")).toHaveText(beerSignals!.countryBrand!.brandName);
 }finally{await db.delete(draws).where(eq(draws.shareToken,token));}
});
