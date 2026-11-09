import manifest from "@/data/beer-artwork.json";
export type BeerArtwork = {country:string;brand:string;src:string;source:string;author:string;license:string;licenseUrl:string};
/** Approved local artwork only, never arbitrary URLs from a snapshot. */
export function beerArtworkFor(country:string, brand:string):BeerArtwork|undefined {
  return (Object.values(manifest) as BeerArtwork[]).find(a=>a.country===country && a.brand===brand);
}
