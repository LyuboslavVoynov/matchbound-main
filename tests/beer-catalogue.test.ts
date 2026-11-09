import { describe, expect, it, vi } from "vitest";
import catalogue from "../data/beer-catalogue.json";
import { beerCatalogueSchema, beerOriginFor } from "@/domain/beer-catalogue";
import { snapshotBeerSignals } from "@/domain/beer-signals";
import { findBeerSignalsForFixture } from "@/db/beer-signal-repository";
import type { Database } from "@/db/client";

describe("reviewed product catalogue", () => {
  it("validates 20 distinct German products and rejects duplicates or broken provenance", () => {
    expect(beerCatalogueSchema.parse(catalogue).products).toHaveLength(20);
    expect(beerCatalogueSchema.safeParse({...catalogue,products:[...catalogue.products,catalogue.products[0]]}).success).toBe(false);
    expect(beerCatalogueSchema.safeParse({...catalogue,products:[{...catalogue.products[0],breweryId:"missing"}]}).success).toBe(false);
    expect(beerCatalogueSchema.safeParse({...catalogue,products:[{...catalogue.products[0],validUntil:"2025-01-01T00:00:00Z"}]}).success).toBe(false);
  });
  it("keeps UK nations separate and supports the expanded European countries", () => {
    expect(beerOriginFor("Wales")).toEqual({countryCode:"GB",originNation:"Wales"});
    expect(beerOriginFor("England")).not.toEqual(beerOriginFor("Scotland"));
    expect(beerOriginFor("Portugal")?.countryCode).toBe("PT");
    expect(beerOriginFor("Netherlands")?.countryCode).toBe("NL");
    expect(beerOriginFor("Unknown")).toBeUndefined();
  });
  it("snapshots product facts without requiring artwork or ABV", () => {
    const brand={countryName:"Germany",brandName:"Augustiner Edelstoff",productId:"augustiner-2",breweryName:"Augustiner",abvBasisPoints:560,sourceUrl:"https://www.augustiner-braeu.de/en/our-beers/"};
    expect(snapshotBeerSignals({countryBrand:brand})?.countryBrand).toEqual(brand);
  });
  const mockDb = (products: unknown[], reject = false) => {
    const findMany=vi.fn().mockResolvedValue([{countryName:"Germany",brandName:"Legacy",originStatement:"Reviewed"}]);
    const db={select:()=>({from:()=>({innerJoin:()=>({where:()=>reject?Promise.reject(new Error("offline")):Promise.resolve(products)})})}),query:{countryBeerBrands:{findMany},beerCityPrices:{findFirst:vi.fn().mockRejectedValue(new Error("offline"))}}};
    return {db:db as unknown as Database,findMany};
  };
  it("uses products instead of double-counting legacy brands", async () => {
    const {db,findMany}=mockDb([{productId:"augustiner-2",name:"Edelstoff",breweryName:"Augustiner",abvBasisPoints:560,style:null,sourceUrl:"https://example.com"}]);
    const result=await findBeerSignalsForFixture(db,"Germany","Berlin");
    expect(result?.countryBrand?.brandName).toBe("Augustiner Edelstoff");
    expect(result?.countryBrand?.abvBasisPoints).toBe(560);
    expect(findMany).not.toHaveBeenCalled();
  });
  it("falls back on empty or unavailable product tables and independent price failure", async () => {
    for(const reject of [false,true]) {
      const {db}=mockDb([],reject);
      expect((await findBeerSignalsForFixture(db,"Germany","Berlin"))?.countryBrand?.brandName).toBe("Legacy");
    }
  });
});
