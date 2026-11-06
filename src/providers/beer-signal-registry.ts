export type BeerCityPriceRecord = Readonly<{
  countryCode: string;
  cityId: string;
  cityName: string;
  averagePriceMinor: number;
  currency: string;
  servingMl: number;
  servingLabel: string;
  metricDefinition: string;
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  reviewedAt: string;
  validUntil: string;
}>;

export type CountryBeerBrandRecord = Readonly<{
  countryCode: string;
  countryName: string;
  brandName: string;
  originStatement: string;
  sourceName: string;
  sourceUrl: string;
  reviewedAt: string;
  validUntil: string;
}>;

/**
 * Editorially reviewed factual signals. They are not recommendations, rankings,
 * nor venue prices. A missing record deliberately yields no signal.
 */
export const reviewedBeerCityPrices: readonly BeerCityPriceRecord[] = [
  {
    countryCode: "IT",
    cityId: "milan-it",
    cityName: "Milan",
    averagePriceMinor: 600,
    currency: "EUR",
    servingMl: 500,
    servingLabel: "0.5 L local draft beer",
    metricDefinition: "2026 Milan average for a 0.5 L local draught beer in a restaurant/bar; indicative, not venue-specific. Reported range: €5–€8.",
    sourceName: "Combien-coute.net",
    sourceUrl: "https://www.combien-coute.net/biere-locale/italie/milan/",
    observedAt: "2026-09-04T00:00:00.000Z",
    reviewedAt: "2026-10-05T00:00:00.000Z",
    validUntil: "2026-12-03T00:00:00.000Z",
  },
  {
    countryCode: "DE",
    cityId: "berlin-de",
    cityName: "Berlin",
    averagePriceMinor: 490,
    currency: "EUR",
    servingMl: 500,
    servingLabel: "0.5 L draft beer",
    metricDefinition: "2026 Berlin average for a 0.5 L draft/local beer in a restaurant; indicative, not venue-specific.",
    sourceName: "Combien-coute.net",
    sourceUrl: "https://www.combien-coute.net/biere-locale/allemagne/berlin/",
    observedAt: "2026-08-29T00:00:00.000Z",
    reviewedAt: "2026-10-05T00:00:00.000Z",
    validUntil: "2026-11-27T00:00:00.000Z",
  },
];

export const reviewedCountryBeerBrands: readonly CountryBeerBrandRecord[] = [
  {
    countryCode: "GB",
    countryName: "England",
    brandName: "London Pride",
    originStatement: "A Chiswick, London original.",
    sourceName: "Fuller's",
    sourceUrl: "https://www.fullers.co.uk/corporate/about-us/history-and-heritage",
    reviewedAt: "2026-10-05T00:00:00.000Z",
    validUntil: "2027-10-05T00:00:00.000Z",
  },
  {
    countryCode: "DE", countryName: "Germany", brandName: "Berliner Kindl Weisse",
    originStatement: "A Berlin original from a brewery founded in 1872.", sourceName: "Berliner Kindl",
    sourceUrl: "https://www.berliner-kindl.de/berliner-kindl-weisse/das-original/",
    reviewedAt: "2026-10-05T00:00:00.000Z", validUntil: "2027-10-05T00:00:00.000Z",
  },
  {
    countryCode: "GB", countryName: "England", brandName: "ESB",
    originStatement: "First brewed in Chiswick, London, in 1971.", sourceName: "Fuller's",
    sourceUrl: "https://www.fullers.co.uk/blog/brewery-articles/fullers-celebrates-173-years",
    reviewedAt: "2026-10-05T00:00:00.000Z", validUntil: "2027-10-05T00:00:00.000Z",
  },
  {
    countryCode: "DE",
    countryName: "Germany",
    brandName: "Berliner Pilsner",
    originStatement: "Founded in East Berlin in 1963.",
    sourceName: "Berliner Pilsner",
    sourceUrl: "https://www.berliner-pilsner.com/origin/",
    reviewedAt: "2026-10-05T00:00:00.000Z",
    validUntil: "2027-10-05T00:00:00.000Z",
  },
  {
    countryCode: "ES",
    countryName: "Spain",
    brandName: "Mahou",
    originStatement: "Mahou's first beer-production site opened in Madrid in 1890.",
    sourceName: "Mahou",
    sourceUrl: "https://www.mahou.com/en/history/130-years/",
    reviewedAt: "2026-10-05T00:00:00.000Z",
    validUntil: "2027-10-05T00:00:00.000Z",
  },
  {
    countryCode: "ES", countryName: "Spain", brandName: "Mahou Clásica",
    originStatement: "The original Mahou recipe, released in 1890.", sourceName: "Mahou",
    sourceUrl: "https://www.mahou.com/beers/mahou-clasica/",
    reviewedAt: "2026-10-05T00:00:00.000Z", validUntil: "2027-10-05T00:00:00.000Z",
  },
  {
    countryCode: "FR",
    countryName: "France",
    brandName: "Kronenbourg",
    originStatement: "Brasseries Kronenbourg was founded in Strasbourg, France, in 1664.",
    sourceName: "Brasseries Kronenbourg",
    sourceUrl: "https://www.kronenbourg.com/lentreprise/brasseries-kronenbourg/lhistoire-de-brasseries-kronenbourg/",
    reviewedAt: "2026-10-05T00:00:00.000Z",
    validUntil: "2027-10-05T00:00:00.000Z",
  },
  {
    countryCode: "FR", countryName: "France", brandName: "1664",
    originStatement: "Launched in France in 1952.", sourceName: "Brasseries Kronenbourg",
    sourceUrl: "https://www.kronenbourg.com/lentreprise/brasseries-kronenbourg/lhistoire-de-brasseries-kronenbourg/",
    reviewedAt: "2026-10-05T00:00:00.000Z", validUntil: "2027-10-05T00:00:00.000Z",
  },
];

function validDates(reviewedAt: string, validUntil: string) {
  return !Number.isNaN(Date.parse(reviewedAt)) && !Number.isNaN(Date.parse(validUntil)) && new Date(validUntil) > new Date(reviewedAt);
}

export function validateBeerSignalRegistry() {
  const errors: string[] = [];
  const priceKeys = new Set<string>();
  for (const record of reviewedBeerCityPrices) {
    const key = `${record.countryCode}:${record.cityId}`;
    if (priceKeys.has(key)) errors.push(`Duplicate beer city price: ${key}`);
    priceKeys.add(key);
    if (!/^[A-Z]{2}$/.test(record.countryCode) || !record.cityName || record.averagePriceMinor <= 0 || !/^[A-Z]{3}$/.test(record.currency) || record.servingMl <= 0 || !record.servingLabel || !record.metricDefinition || !record.sourceName || !record.sourceUrl || !validDates(record.reviewedAt, record.validUntil) || Number.isNaN(Date.parse(record.observedAt))) errors.push(`Invalid beer city price: ${key}`);
  }
  const countryBrandKeys = new Set<string>();
  for (const record of reviewedCountryBeerBrands) {
    const key = `${record.countryCode}:${record.brandName}`;
    if (countryBrandKeys.has(key)) errors.push(`Duplicate country beer brand: ${key}`);
    countryBrandKeys.add(key);
    if (!/^[A-Z]{2}$/.test(record.countryCode) || !record.countryName || !record.brandName || !record.originStatement || !record.sourceName || !record.sourceUrl || !validDates(record.reviewedAt, record.validUntil)) errors.push(`Invalid country beer brand: ${key}`);
  }
  return errors;
}
