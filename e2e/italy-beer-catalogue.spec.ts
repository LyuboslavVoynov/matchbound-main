import "dotenv/config";
import {expect,test} from "@playwright/test";
import {and,eq,gte} from "drizzle-orm";
import {randomBytes} from "node:crypto";
import {createDb} from "../src/db/client";
import {competitions,draws,fixtures,venues} from "../src/db/schema";
import {findBeerSignalsForFixture} from "../src/db/beer-signal-repository";
import {drawVisualIdentity} from "../src/domain/visual-identity";
import catalogue from "../data/beer-catalogue.italy.json";
import type {DrawResultSnapshot} from "../src/domain/result";

test.skip(!process.env.ITALY_BEER_BASE_URL,"Explicit deployment target required");
for(const city of ["Rome","Milan"]){
 test(city+" Italian beer source and selection persist on the ticket",async({page},info)=>{
  const db=createDb();const token=randomBytes(24).toString("base64url");
  const [row]=await db.select({fixture:fixtures,venue:venues,competition:competitions}).from(fixtures).innerJoin(venues,eq(fixtures.venueId,venues.id)).innerJoin(competitions,eq(fixtures.competitionId,competitions.id)).where(and(eq(venues.country,"Italy"),eq(venues.city,city),eq(venues.reviewed,true),eq(fixtures.status,"confirmed"),gte(fixtures.kickoffDate,new Date().toISOString().slice(0,10)))).limit(1);
  expect(row).toBeTruthy();
  let beerSignals=await findBeerSignalsForFixture(db,"Italy",city);
  expect(beerSignals?.countryBrand?.productId).toMatch(/^it-/);
  expect(beerSignals?.countryBrand?.countryName).toBe("Italy");
  // Keep one live random selection and one controlled long name for mobile wrapping.
  if(city==="Milan"){
   const product=catalogue.products.find(p=>p.id==="it-poretti-5-luppoli-chiara")!;
   beerSignals={...beerSignals,countryBrand:{countryName:"Italy",productId:product.id,brandName:"Angelo Poretti "+product.name,breweryName:"Angelo Poretti",abvBasisPoints:product.abvBasisPoints,sourceUrl:product.sourceUrl}};
  }
  const beer=beerSignals!.countryBrand!;
  const result:DrawResultSnapshot={country:row.venue.country,city,stadium:row.venue.stadium,competition:row.competition.name,homeTeam:row.fixture.homeTeam,awayTeam:row.fixture.awayTeam,kickoffAt:row.fixture.kickoffAt.toISOString(),kickoffDate:row.fixture.kickoffDate,timezone:row.venue.timezone,officialTicketUrl:row.fixture.officialTicketUrl,beerSignals,visualIdentity:drawVisualIdentity({competitionEmblemUrl:row.competition.emblemUrl,countryFlagUrl:row.competition.areaFlagUrl,homeTeamCrestUrl:row.fixture.homeTeamCrestUrl,awayTeamCrestUrl:row.fixture.awayTeamCrestUrl})};
  await db.insert(draws).values({shareToken:token,fixtureId:row.fixture.id,resultSnapshot:result,tripStartDate:result.kickoffDate,tripEndDate:result.kickoffDate,expiresAt:new Date(Date.now()+3600000)});
  try{
   await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/m/"+token);
   await page.getByRole("button",{name:"Reveal my beer"}).click();
   const ticket=page.locator(".beer-ticket");
   await expect(ticket.locator("h2")).toHaveText(beer.brandName);
   await expect(ticket).toContainText(beer.abvBasisPoints!/100+"% ABV");
   await expect(ticket.getByRole("link",{name:/Brewery source/})).toHaveAttribute("href",beer.sourceUrl!);
   await expect(ticket.locator(".beer-seal")).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:info.outputPath(city+"-beer-ticket.png"),fullPage:true,animations:"disabled"});
   await page.reload();
   await expect(ticket).toHaveAttribute("data-beer-state","revealed");
   await expect(ticket.locator("h2")).toHaveText(beer.brandName);
  }finally{await db.delete(draws).where(eq(draws.shareToken,token));}
 });
}
