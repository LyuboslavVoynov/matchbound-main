import {expect,test} from "@playwright/test";

test("date choices precede supporting art and are reachable in the first mobile view",async({page,isMobile},info)=>{
 await page.goto("/");await page.evaluate(()=>document.fonts.ready);
 const start=page.getByRole("button",{name:"Trip starts",exact:true});
 await expect(page.locator("#trip-calendar-panel")).toBeHidden();
 await expect(page.getByRole("button",{name:"Draw my match",exact:true}).locator(".draw-arrow")).toBeVisible();
 if(isMobile){
  const dates=await start.boundingBox();const illustration=await page.locator(".group-illustration").boundingBox();
  expect(dates!.y+dates!.height).toBeLessThan(page.viewportSize()!.height);
  expect(dates!.y).toBeLessThan(illustration!.y);
  if(page.viewportSize()!.width>=390){const draw=await page.getByRole("button",{name:"Draw my match",exact:true}).boundingBox();expect(draw!.y+draw!.height).toBeLessThan(page.viewportSize()!.height);}
 }
 await start.click();await expect(page.locator("#trip-calendar-panel")).toBeVisible();
 await page.getByRole("button",{name:"Close calendar",exact:true}).click();
 await expect(page.locator("#trip-calendar-panel")).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath("landing.png"),fullPage:true,animations:"disabled"});
});

for(const destination of ["porto","fallback"]){
 test(destination+" reveal keeps every closed card and caption inside the viewport",async({page},info)=>{
  await page.clock.install();await page.goto("/design/weekend-journal/play?destination="+destination,{waitUntil:"networkidle"});
  for(const stage of ["country","city","competition","stadium","clubs"]){
   for(let i=0;i<70;i++){if(await page.locator("main").getAttribute("data-active-stage")===stage)break;await page.clock.runFor(100);}
   await expect(page.locator("main")).toHaveAttribute("data-active-stage",stage);
   await page.clock.runFor(1700);
   const card=page.locator(".journal-live-card");
   // Settle the CSS transform independently of the autoplay clock.
   await card.evaluate(el=>el.getAnimations().forEach(animation=>animation.finish()));
   const box=await card.boundingBox();const caption=await page.locator(".journal-live-caption").boundingBox();
   expect(box!.y).toBeGreaterThanOrEqual(0);
   expect(box!.y+box!.height).toBeLessThanOrEqual(page.viewportSize()!.height-12);
   expect(caption!.y+caption!.height).toBeLessThanOrEqual(box!.y+box!.height);
   const art=page.locator(".journal-live-art");const artBox=await art.boundingBox();
   for(const child of await art.locator(":scope > .teams, :scope > p, :scope > strong, :scope > img, :scope > figcaption, :scope > span:not(.journal-ground-lines)").all()){
    const childBox=await child.boundingBox();if(childBox)expect(childBox.y+childBox.height).toBeLessThanOrEqual(artBox!.y+artBox!.height+1);
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await expect(page.locator(".journal-editorial-mark")).toHaveCount(0);
   if(stage==="city"||stage==="clubs")await page.screenshot({path:info.outputPath(destination+"-"+stage+".png"),animations:"disabled"});
  }
 });
}
