import {describe,it,expect} from "vitest";
import england from "../data/beer-catalogue.england.json";
import france from "../data/beer-catalogue.france.json";
import italy from "../data/beer-catalogue.italy.json";
import spain from "../data/beer-catalogue.spain.json";
import dutch from "../data/beer-catalogue.netherlands.json";
import portugal from "../data/beer-catalogue.portugal.json";
import germany from "../data/beer-catalogue.json";
import {beerCatalogueSchema,beerOriginFor} from "@/domain/beer-catalogue";

describe("England reviewed country batch",()=>{
 it("adds twenty English products without collisions across seven countries",()=>{
  const batch=beerCatalogueSchema.parse(england);
  expect(batch.products).toHaveLength(20);
  expect(batch.breweries).toHaveLength(3);
  expect(batch.breweries.every(b=>b.countryCode==="GB"&&b.originNation==="England")).toBe(true);
  expect(batch.products.every(p=>p.approvalStatus==="approved"&&p.active)).toBe(true);
  const catalogues=[germany,portugal,dutch,spain,italy,france,england].map(c=>beerCatalogueSchema.parse(c));
  expect(beerCatalogueSchema.parse({breweries:catalogues.flatMap(c=>c.breweries),products:catalogues.flatMap(c=>c.products)}).products).toHaveLength(140);
  for(const nation of ["Scotland","Wales","Northern Ireland"]){
   expect(beerOriginFor(nation)).not.toEqual(beerOriginFor("England"));
  }
 });
 it("omits format-dependent strengths and uses current producer specifications",()=>{
  const products=new Map(england.products.map(p=>[p.id,p]));
  for(const id of ["en-timothy-taylor-landlord","en-timothy-taylor-landlord-dark","en-timothy-taylor-boltmaker","en-st-austell-proper-job"]){
   expect(products.get(id)?.abvBasisPoints).toBeNull();
  }
  expect(products.get("en-timothy-taylor-blonde")?.abvBasisPoints).toBe(380);
  expect(products.get("en-theakston-pale")?.abvBasisPoints).toBe(450);
  expect(products.get("en-st-austell-anthem")?.abvBasisPoints).toBe(340);
  expect(products.get("en-st-austell-big-job")?.abvBasisPoints).toBe(720);
 });
});
