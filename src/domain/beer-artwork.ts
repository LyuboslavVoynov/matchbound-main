import manifest from "@/data/beer-artwork.json";
import productManifest from "@/data/beer-product-artwork.json";
import {productBeerArtworkFor} from "./beer-product-artwork";
export type BeerArtwork = {country:string;brand:string;src:string;source:string;author:string;license:string;licenseUrl:string;kind?:"product-photo"|"product-logo"|"brewery-logo";note?:string};
/** Approved local artwork only, never arbitrary URLs from a snapshot. */
export function beerArtworkFor(country:string, brand:string, productId?:string):BeerArtwork|undefined {
  if(productId)return productBeerArtworkFor(productManifest,country,productId);
  return (Object.values(manifest) as BeerArtwork[]).find(a=>a.country===country && a.brand===brand);
}
