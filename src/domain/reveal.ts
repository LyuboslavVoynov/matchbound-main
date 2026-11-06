import type { DrawResultSnapshot } from "./result";

export const REVEAL_STAGES = ["country", "city", "stadium", "match"] as const;
export type RevealStage = (typeof REVEAL_STAGES)[number];

export function revealValue(stage: RevealStage, result: DrawResultSnapshot) {
  switch (stage) {
    case "country": return result.country;
    case "city": return result.city;
    case "stadium": return result.stadium;
    case "match": return `${result.homeTeam} v ${result.awayTeam}`;
  }
}
