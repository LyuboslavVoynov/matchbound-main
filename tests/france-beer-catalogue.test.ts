import {describe,it,expect} from "vitest";
import france from "../data/beer-catalogue.france.json";
import italy from "../data/beer-catalogue.italy.json";
import spain from "../data/beer-catalogue.spain.json";
import dutch from "../data/beer-catalogue.netherlands.json";
import portugal from "../data/beer-catalogue.portugal.json";
import germany from "../data/beer-catalogue.json";
import {beerCatalogueSchema} from "@/domain/beer-catalogue";

describe("France reviewed country batch",()=>{
 it("adds twenty domestic products without collisions across six countries",()=>{
  const batch=beerCatalogueSchema.parse(france);
  expect(batch.products).toHaveLength(20);
  expect(batch.breweries).toHaveLength(3);
  expect(batch.breweries.every(b=>b.countryCode==="FR"&&b.originNation==="France")).toBe(true);
  expect(batch.products.every(p=>p.approvalStatus==="approved"&&p.active&&p.abvBasisPoints!==null&&p.abvBasisPoints>0)).toBe(true);
  const catalogues=[germany,portugal,dutch,spain,italy,france].map(c=>beerCatalogueSchema.parse(c));
  expect(beerCatalogueSchema.parse({breweries:catalogues.flatMap(c=>c.breweries),products:catalogues.flatMap(c=>c.products)}).products).toHaveLength(120);
 });
 it("uses actual strengths and leaves unestablished styles absent",()=>{
  const products=new Map(france.products.map(p=>[p.id,p]));
  expect(products.get("fr-3-monts-triple")?.abvBasisPoints).toBe(950);
  expect(products.get("fr-3-monts-saison")?.style).toBeNull();
  expect(products.get("fr-mont-blanc-la-neipa")?.abvBasisPoints).toBe(470);
  expect(products.get("fr-mont-blanc-triple-epices")?.abvBasisPoints).toBe(720);
  expect(products.get("fr-mont-blanc-la-cristal")?.style).toBe("Pale Ale");
  expect(products.get("fr-goudale-hop-lager")?.abvBasisPoints).toBe(520);
 });
});
