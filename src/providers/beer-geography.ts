export type BeerGeography = Readonly<{ countryCode: string; cityId: string }>;

/** Reviewed display-location mapping. Absence intentionally means no beer signal. */
const geography: Readonly<Record<string, BeerGeography>> = {
  "England:London": { countryCode: "GB", cityId: "london-gb" },
  "Spain:Madrid": { countryCode: "ES", cityId: "madrid-es" },
  "Germany:Berlin": { countryCode: "DE", cityId: "berlin-de" },
  "Italy:Milan": { countryCode: "IT", cityId: "milan-it" },
  "France:Paris": { countryCode: "FR", cityId: "paris-fr" },
};

const countryCodes: Readonly<Record<string, string>> = {
  England: "GB",
  Spain: "ES",
  Germany: "DE",
  Italy: "IT",
  France: "FR",
};

export function beerGeographyFor(country: string, city: string): BeerGeography | undefined {
  return geography[`${country}:${city}`];
}

/** Country-brand provenance remains usable when a city has no reviewed price coverage. */
export function beerCountryCodeFor(country: string): string | undefined {
  return countryCodes[country];
}
