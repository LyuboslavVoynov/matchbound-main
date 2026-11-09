import assets from "@/data/journal-assets.json";
import type { DrawResultSnapshot } from "./result";

export type JournalPhoto = Readonly<{ src: string; title: string; author: string; license: string; licenseUrl: string; source: string; original: string; note: string; bytes: number; alt: string; position?: string }>;
export type JournalVisualSet = { country?: JournalPhoto; city?: JournalPhoto; stadium?: JournalPhoto };
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const destinations = [
  { city: "Porto", country: "Portugal", stadiums: ["Estádio do Dragão"], cityAsset: "porto-city", stadiumAsset: "porto-stadium", landmark: "Dom Luís I Bridge, Porto" },
  { city: "Milan", country: "Italy", stadiums: ["San Siro", "Stadio Giuseppe Meazza", "Giuseppe Meazza"], cityAsset: "milan-city", stadiumAsset: "milan-stadium", landmark: "Duomo di Milano" },
  { city: "Bilbao", country: "Spain", stadiums: ["San Mamés", "Estadio San Mamés"], cityAsset: "bilbao-city", stadiumAsset: "bilbao-stadium", landmark: "Guggenheim Museum, Bilbao" },
] as const;
const countries: Record<string, { key: keyof typeof assets; alt: string }> = {
  portugal: { key: "portugal-country", alt: "Algarve coast, Portugal — a country scene" },
  italy: { key: "italy-country", alt: "Tuscan countryside, Italy — a country scene" },
  spain: { key: "spain-country", alt: "Gaztelugatxe on Spain’s Basque coast — a country scene" },
};
/** Curated exact mappings: city artwork never implies a verified stadium. */
export function journalVisuals(result: Pick<DrawResultSnapshot, "country" | "city" | "stadium">): JournalVisualSet {
  const country = countries[normalize(result.country)];
  const destination = destinations.find(d => normalize(d.city) === normalize(result.city) && normalize(d.country) === normalize(result.country));
  const groundMatches = destination?.stadiums.some(s => normalize(s) === normalize(result.stadium));
  return {
    country: country ? { ...assets[country.key], alt: country.alt } : undefined,
    city: destination ? { ...assets[destination.cityAsset], alt: destination.landmark } : undefined,
    stadium: destination && groundMatches ? { ...assets[destination.stadiumAsset], alt: result.stadium } : undefined,
  };
}
