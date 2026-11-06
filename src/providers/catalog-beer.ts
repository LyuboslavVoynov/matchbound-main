import "dotenv/config";

const API_ROOT = "https://api.catalog.beer";

export type CatalogBeerBrewer = Readonly<{
  id: string;
  name: string;
  cb_verified: boolean;
  brewer_verified: boolean;
  last_modified: number;
}>;

export const catalogBeerBrandQueries = [
  { countryCode: "GB", brandName: "London Pride", query: "Fuller's", expectedBrewerName: "Fuller, Smith & Turner PLC" },
  { countryCode: "DE", brandName: "Berliner Pilsner", query: "Berliner Pilsner", expectedBrewerName: "Berliner Pilsner" },
  { countryCode: "ES", brandName: "Mahou", query: "Mahou", expectedBrewerName: "Mahou S.A." },
  { countryCode: "FR", brandName: "Kronenbourg", query: "Kronenbourg", expectedBrewerName: "Brasseries Kronenbourg" },
] as const;

export function findExactCatalogBeerBrewer(matches: readonly CatalogBeerBrewer[], expectedBrewerName: string) {
  return matches.find((match) => match.name.localeCompare(expectedBrewerName, undefined, { sensitivity: "accent" }) === 0);
}

type CatalogBeerList<T> = Readonly<{ data: T[] }>;

function credentials() {
  const key = process.env.CATALOG_BEER_API_KEY;
  if (!key) throw new Error("CATALOG_BEER_API_KEY is required");
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

/** Server-only read client. Provider output remains review input, never direct UI data. */
export async function searchCatalogBeerBrewers(query: string): Promise<readonly CatalogBeerBrewer[]> {
  const response = await fetch(`${API_ROOT}/brewer/search?q=${encodeURIComponent(query)}&count=10`, {
    headers: { accept: "application/json", authorization: credentials() },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Catalog.beer request failed (${response.status})`);
  const body = await response.json() as CatalogBeerList<CatalogBeerBrewer>;
  return body.data;
}
