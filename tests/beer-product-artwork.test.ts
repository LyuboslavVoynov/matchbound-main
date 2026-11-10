import {describe,it,expect} from "vitest";
import {beerProductArtworkSchema,productBeerArtworkFor} from "@/domain/beer-product-artwork";
import {beerArtworkFor} from "@/domain/beer-artwork";
const asset={productId:"augustiner-2",country:"Germany",brand:"Augustiner Edelstoff",src:"/beer/products/augustiner-edelstoff.webp",source:"https://example.com/source",original:"https://example.com/original",title:"Product photograph",author:"Creator",license:"CC BY 4.0",licenseUrl:"https://creativecommons.org/licenses/by/4.0/",sha256:"a".repeat(64),reviewedAt:"2026-11-09T00:00:00Z",approvalStatus:"approved"};
const manifest={version:1,assets:[asset]};
describe("product-specific artwork gates",()=>{
 it("matches approved exact product and country only",()=>{
  expect(productBeerArtworkFor(manifest,"Germany","augustiner-2")?.src).toBe(asset.src);
  expect(productBeerArtworkFor(manifest,"Portugal","augustiner-2")).toBeUndefined();
  expect(productBeerArtworkFor(manifest,"Germany","augustiner-1")).toBeUndefined();
  expect(productBeerArtworkFor({...manifest,assets:[{...asset,approvalStatus:"pending"}]},"Germany","augustiner-2")).toBeUndefined();
 });
 it("rejects duplicate IDs, path escape, mismatched licences and credential-bearing sources",()=>{
  for(const assets of [[asset,asset],[{...asset,src:"/beer/products/../private.png"}],[{...asset,license:"CC BY-NC 4.0"}],[{...asset,source:"https://user:secret@example.com/image"}],[{...asset,licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"}]])expect(beerProductArtworkSchema.safeParse({...manifest,assets}).success).toBe(false);
 });
 it("keeps legacy artwork but never assigns it to a different product snapshot",()=>{
  expect(beerArtworkFor("Germany","Berliner Pilsner")?.src).toBeTruthy();
  expect(beerArtworkFor("Germany","Berliner Pilsner","unknown-product")).toBeUndefined();
 });
});
