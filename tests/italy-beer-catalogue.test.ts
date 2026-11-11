import {describe,it,expect} from "vitest";
import italy from "../data/beer-catalogue.italy.json";
import spain from "../data/beer-catalogue.spain.json";
import dutch from "../data/beer-catalogue.netherlands.json";
import portugal from "../data/beer-catalogue.portugal.json";
import germany from "../data/beer-catalogue.json";
import {beerCatalogueSchema} from "@/domain/beer-catalogue";

describe("Italy reviewed country batch",()=>{
 it("adds twenty domestic products without collisions with the released countries",()=>{
  const batch=beerCatalogueSchema.parse(italy);
  expect(batch.products).toHaveLength(20);
  expect(batch.breweries).toHaveLength(3);
  expect(batch.breweries.every(b=>b.countryCode==="IT"&&b.originNation==="Italy")).toBe(true);
  expect(batch.products.every(p=>p.approvalStatus==="approved"&&p.active&&p.abvBasisPoints!==null&&p.abvBasisPoints>0)).toBe(true);
  const catalogues=[germany,portugal,dutch,spain,italy].map(c=>beerCatalogueSchema.parse(c));
  expect(beerCatalogueSchema.parse({breweries:catalogues.flatMap(c=>c.breweries),products:catalogues.flatMap(c=>c.products)}).products).toHaveLength(100);
 });
 it("retains changed recipes and actual strengths rather than guessing from names",()=>{
  const products=new Map(italy.products.map(p=>[p.id,p]));
  expect(products.get("it-baladin-leon")?.abvBasisPoints).toBe(850);
  expect(products.get("it-ducato-afo")?.abvBasisPoints).toBe(470);
  expect(products.get("it-ducato-afo")?.style).toBe("Session IPA");
  expect(products.get("it-ducato-white-riot")?.abvBasisPoints).toBe(400);
  expect(products.get("it-poretti-4-luppoli-originale")?.abvBasisPoints).toBe(500);
  expect(products.get("it-poretti-6-luppoli-rossa")?.abvBasisPoints).toBe(700);
 });
});
