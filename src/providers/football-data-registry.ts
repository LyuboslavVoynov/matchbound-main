export type CompetitionProfile = Readonly<{ code: string; name: string; country: string }>;

/** Deliberate product allowlist. Other plan-visible competitions are not draw-eligible by default. */
export const SUPPORTED_COMPETITIONS: readonly CompetitionProfile[] = [
  { code: "PL", name: "Premier League", country: "England" },
  { code: "PD", name: "La Liga", country: "Spain" },
  { code: "BL1", name: "Bundesliga", country: "Germany" },
  { code: "SA", name: "Serie A", country: "Italy" },
  { code: "FL1", name: "Ligue 1", country: "France" },
  { code: "ELC", name: "Championship", country: "England" },
  { code: "DED", name: "Eredivisie", country: "Netherlands" },
  { code: "PPL", name: "Primeira Liga", country: "Portugal" },
];

export function supportedCompetition(code: string | null): CompetitionProfile | undefined {
  return SUPPORTED_COMPETITIONS.find((competition) => competition.code === code);
}

/** An explicit scope prevents unrelated roster changes from blocking a selected-league sync. */
export function selectCompetitions(codes?: string): readonly CompetitionProfile[] {
  if (codes === undefined) return SUPPORTED_COMPETITIONS;
  const selected = codes.split(",").map(code => code.trim().toUpperCase());
  if (selected.some(code => !code || !supportedCompetition(code))) throw new Error("Select supported competition codes only.");
  return [...new Set(selected)].map(code => supportedCompetition(code)!);
}
