import { expect, test } from "@playwright/test";
const demo="/design/weekend-journal/play?destination=porto";
test("automatic journal uses 24-second distinct card animations without playback buttons",async({page})=>{
  await page.clock.install();await page.goto(demo,{waitUntil:"domcontentloaded"});
  await expect(page.locator("main")).toHaveAttribute("data-active-stage","brand-intro");
  await expect(page.locator("main button")).toHaveCount(0);
  const seen:string[]=[];const animations=new Set<string>();let last="";
  for(let i=0;i<260;i++){
    if(new URL(page.url()).pathname.endsWith("/complete"))break;
    const stage=await page.locator("main").getAttribute("data-active-stage");
    if(stage&&stage!==last){seen.push(stage);last=stage;
      if(["country","city","competition","stadium","clubs"].includes(stage))animations.add(await page.locator(".journal-live-card").evaluate(el=>getComputedStyle(el).animationName));
    }
    if(stage && ["country","city","competition","stadium","clubs"].includes(stage)) {
      expect(await page.locator(".journal-live-art").evaluate(el=>getComputedStyle(el).animationName)).toBe("none");
    }
    await page.clock.runFor(100);
  }
  expect(seen).toEqual(["brand-intro","country","city","competition","stadium","clubs","brand-outro"]);
  expect(animations.size).toBe(5);
  await page.waitForURL("**/weekend-journal/complete");await page.clock.runFor(1000);
  await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
});
test("photo credits temporarily suspend autoplay and closing them resumes it",async({page})=>{
  await page.clock.install();await page.goto(demo,{waitUntil:"domcontentloaded"});
  for(let i=0;i<30;i++)await page.clock.runFor(100);
  await expect(page.locator("main")).toHaveAttribute("data-active-stage","country");
  await page.getByText("Photo credit",{exact:true}).click();
  await expect(page.locator("main")).toHaveAttribute("data-playback","paused");
  await page.clock.runFor(10000);
  await expect(page.locator("main")).toHaveAttribute("data-active-stage","country");
  await page.getByText("Photo credit",{exact:true}).click();
  await expect(page.locator("main")).toHaveAttribute("data-playback","playing");
  for(let i=0;i<40;i++)await page.clock.runFor(100);
  await expect(page.locator("main")).toHaveAttribute("data-active-stage","city");
});
test("failed photos use editorial fallback and reduced motion goes directly to the result",async({page})=>{
  await page.route("**/journal/*.webp",route=>route.abort());
  await page.clock.install();await page.goto(demo,{waitUntil:"domcontentloaded"});
  for(let i=0;i<30;i++)await page.clock.runFor(100);
  await expect(page.locator("main")).toHaveAttribute("data-active-stage","country");
  await expect(page.locator(".journal-editorial")).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.emulateMedia({reducedMotion:"reduce"});await page.waitForURL("**/weekend-journal/complete");
  await expect(page.locator(".result-handoff-overlay")).toHaveCount(0);
});
