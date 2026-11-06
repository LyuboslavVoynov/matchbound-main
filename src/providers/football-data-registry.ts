export type CompetitionProfile = Readonly<{ code: string; name: string; country: string }>;

/** Deliberate product allowlist. Other plan-visible competitions are not draw-eligible by default. */
export const SUPPORTED_COMPETITIONS: readonly CompetitionProfile[] = [
  { code: "PL", name: "Premier League", country: "England" },
  { code: "PD", name: "La Liga", country: "Spain" },
  { code: "BL1", name: "Bundesliga", country: "Germany" },
  { code: "SA", name: "Serie A", country: "Italy" },
  { code: "FL1", name: "Ligue 1", country: "France" },
];

export function supportedCompetition(code: string | null): CompetitionProfile | undefined {
  return SUPPORTED_COMPETITIONS.find((competition) => competition.code === code);
}
