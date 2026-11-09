import {describe,it,expect} from "vitest";
import data from "../data/beer-catalogue.portugal.json";
import {beerCatalogueSchema} from "@/domain/beer-catalogue";
describe("Portugal candidate batch",()=>{it("keeps twenty distinct Portuguese products ineligible until review",()=>{
 const batch=beerCatalogueSchema.parse(data);expect(batch.products).toHaveLength(20);expect(batch.breweries).toHaveLength(3);
 expect(batch.breweries.every(b=>b.countryCode==="PT"&&b.originNation==="Portugal")).toBe(true);
 expect(batch.products.every(p=>p.approvalStatus==="pending"&&!p.active&&p.abvBasisPoints===null)).toBe(true);
 expect(new Set(batch.products.map(p=>p.id)).size).toBe(20);
})});
