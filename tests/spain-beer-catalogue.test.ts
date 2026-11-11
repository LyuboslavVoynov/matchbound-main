import {describe,it,expect} from "vitest";
import spain from "../data/beer-catalogue.spain.json";
import dutch from "../data/beer-catalogue.netherlands.json";
import portugal from "../data/beer-catalogue.portugal.json";
import germany from "../data/beer-catalogue.json";
import {beerCatalogueSchema} from "@/domain/beer-catalogue";

describe("Spain reviewed country batch",()=>{
 it("adds twenty domestic products without identity collisions across four countries",()=>{
  const batch=beerCatalogueSchema.parse(spain);
  expect(batch.products).toHaveLength(20);
  expect(batch.breweries).toHaveLength(4);
  expect(batch.breweries.every(b=>b.countryCode==="ES"&&b.originNation==="Spain")).toBe(true);
  expect(batch.products.every(p=>p.approvalStatus==="approved"&&p.active&&p.abvBasisPoints!==null&&p.abvBasisPoints>0)).toBe(true);
  const catalogues=[germany,portugal,dutch,spain].map(c=>beerCatalogueSchema.parse(c));
  expect(beerCatalogueSchema.parse({breweries:catalogues.flatMap(c=>c.breweries),products:catalogues.flatMap(c=>c.products)}).products).toHaveLength(80);
 });
 it("does not infer strengths from product names or duplicate renamed products",()=>{
  const products=new Map(spain.products.map(p=>[p.id,p]));
  expect(products.get("es-moritz-7")?.abvBasisPoints).toBe(550);
  expect(products.get("es-moritz-bruta-unfiltered")?.abvBasisPoints).toBe(560);
  expect(products.get("es-alhambra-reserva-esencia-citra-ipa")?.abvBasisPoints).toBe(650);
  expect(products.get("es-estrella-galicia-1906-la-milnueve")?.abvBasisPoints).toBe(650);
  expect(spain.products.some(p=>p.name==="1906 Reserva Especial")).toBe(false);
 });
});
