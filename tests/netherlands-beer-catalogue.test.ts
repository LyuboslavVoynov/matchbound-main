import {describe,it,expect} from "vitest";
import dutch from "../data/beer-catalogue.netherlands.json";
import portugal from "../data/beer-catalogue.portugal.json";
import germany from "../data/beer-catalogue.json";
import {beerCatalogueSchema} from "@/domain/beer-catalogue";

describe("Netherlands reviewed country batch",()=>{
 it("adds twenty distinct domestic products without collisions with released countries",()=>{
  const batch=beerCatalogueSchema.parse(dutch);
  expect(batch.products).toHaveLength(20);
  expect(batch.breweries).toHaveLength(3);
  expect(batch.breweries.every(b=>b.countryCode==="NL"&&b.originNation==="Netherlands")).toBe(true);
  expect(batch.products.every(p=>p.approvalStatus==="approved"&&p.active&&p.abvBasisPoints!==null&&p.abvBasisPoints>0)).toBe(true);
  const combined=beerCatalogueSchema.parse({breweries:[...germany.breweries,...portugal.breweries,...dutch.breweries],products:[...germany.products,...portugal.products,...dutch.products]});
  expect(combined.products).toHaveLength(60);
 });
 it("retains current strengths and counts renamed Texels products only once",()=>{
  const products=new Map(dutch.products.map(p=>[p.id,p]));
  expect(products.get("nl-ij-t-gouden-ij")?.abvBasisPoints).toBe(680);
  expect(products.get("nl-ij-nijpa")?.abvBasisPoints).toBe(620);
  expect(products.get("nl-ij-blondie")?.abvBasisPoints).toBe(580);
  expect(products.get("nl-texels-frisse-wiend")?.abvBasisPoints).toBe(390);
  expect(dutch.products.filter(p=>p.breweryId==="nl-texels").map(p=>p.name)).not.toContain("Blond");
  expect(dutch.products.filter(p=>p.breweryId==="nl-la-trappe").every(p=>p.style===null)).toBe(true);
 });
});
