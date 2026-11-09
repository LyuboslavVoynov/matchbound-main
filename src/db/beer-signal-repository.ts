import { beerOriginFor } from "@/domain/beer-catalogue";
import { and, eq, gt } from "drizzle-orm";
import type { Database } from "./client";
import { beerCityPrices, countryBeerBrands, beerBreweries, beerProducts } from "./schema";
import { beerCountryCodeFor, beerGeographyFor } from "@/providers/beer-geography";
import { snapshotBeerSignals } from "@/domain/beer-signals";
import { selectRandomFixture } from "@/domain/random";

/** Resolves only reviewed geography and currently-valid records. Missing data never blocks a draw. */
export async function findBeerSignalsForFixture(db: Database, country: string, city: string, now = new Date()) {
  const geography = beerGeographyFor(country, city);
  const countryCode = beerCountryCodeFor(country);
  const origin = beerOriginFor(country);
  if (!geography && !countryCode && !origin) return undefined;
  // Optional enrichment must never prevent fixture selection.
  const safely = async <T>(lookup: Promise<T>, fallback: T): Promise<T> => { try { return await lookup; } catch { return fallback; } };
  const products = origin ? await safely(db.select({productId:beerProducts.id, name:beerProducts.name, breweryName:beerBreweries.name, style:beerProducts.style, abvBasisPoints:beerProducts.abvBasisPoints, sourceUrl:beerProducts.sourceUrl}).from(beerProducts).innerJoin(beerBreweries,eq(beerProducts.breweryId,beerBreweries.id)).where(and(eq(beerBreweries.countryCode,origin.countryCode),eq(beerBreweries.originNation,origin.originNation),eq(beerProducts.approvalStatus,"approved"),eq(beerProducts.active,true),gt(beerProducts.validUntil,now))), []) : [];
  const [price, brands] = await Promise.all([
    geography ? safely(db.query.beerCityPrices.findFirst({ columns: { servingLabel: true, averagePriceMinor: true, currency: true, metricDefinition: true, observedAt: true }, where: and(eq(beerCityPrices.countryCode, geography.countryCode), eq(beerCityPrices.cityId, geography.cityId), eq(beerCityPrices.active, true), gt(beerCityPrices.validUntil, now)) }), undefined) : undefined,
    countryCode && !products.length ? safely(db.query.countryBeerBrands.findMany({ columns: { countryName: true, brandName: true, originStatement: true }, where: and(eq(countryBeerBrands.countryCode, countryCode), eq(countryBeerBrands.approvalStatus, "approved"), eq(countryBeerBrands.active, true), gt(countryBeerBrands.validUntil, now)) }), []) : [],
  ]);
  // The selection happens exactly once, while creating the immutable draw snapshot.
  const product = selectRandomFixture(products);
  const brand = product ? {countryName:country,brandName:product.name.toLocaleLowerCase("en").startsWith(product.breweryName.toLocaleLowerCase("en") + " ") ? product.name : product.breweryName + " " + product.name,originStatement:"From " + product.breweryName + ", " + country + ".",productId:product.productId,breweryName:product.breweryName,sourceUrl:product.sourceUrl,...(product.style && {style:product.style}),...(product.abvBasisPoints !== null && {abvBasisPoints:product.abvBasisPoints})} : selectRandomFixture(brands);
  return snapshotBeerSignals({ cityAverage: price ?? undefined, countryBrand: brand ?? undefined });
}
