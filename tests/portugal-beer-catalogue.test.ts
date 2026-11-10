import {describe,it,expect} from "vitest";
import data from "../data/beer-catalogue.portugal.json";
import {beerCatalogueSchema} from "@/domain/beer-catalogue";
describe("Portugal reviewed batch",()=>{it("contains twenty distinct reviewed domestic products with sourced alcohol values",()=>{
 const batch=beerCatalogueSchema.parse(data);expect(batch.products).toHaveLength(20);expect(batch.breweries).toHaveLength(4);
 expect(batch.breweries.every(b=>b.countryCode==="PT"&&b.originNation==="Portugal")).toBe(true);
 expect(batch.products.every(p=>p.approvalStatus==="approved"&&p.active&&p.abvBasisPoints!==null&&p.abvBasisPoints>0)).toBe(true);
 expect(batch.products.some(p=>p.id==="pt-dois-corvos-czech-norris")).toBe(false);
 expect(batch.products.find(p=>p.id==="pt-super-bock-original")?.abvBasisPoints).toBe(520);
 expect(new Set(batch.products.map(p=>p.id)).size).toBe(20);
})});
