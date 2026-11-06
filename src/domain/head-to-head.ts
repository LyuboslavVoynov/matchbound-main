import { z } from "zod";

const team = z.object({ id: z.number().int().positive(), name: z.string().min(1) });
const match = z.object({
  id: z.number().int().positive(), utcDate: z.string().datetime(), status: z.string(),
  homeTeam: team, awayTeam: team,
  competition: z.object({ name: z.string() }),
  score: z.object({ fullTime: z.object({ home: z.number().int().nonnegative().nullable(), away: z.number().int().nonnegative().nullable() }) }),
});
const response = z.object({ matches: z.array(z.unknown()) });

export type HeadToHeadSnapshot = Readonly<{
  asOf: string;
  homeTeamId: number;
  awayTeamId: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  meetings: readonly Readonly<{ id: number; kickoffAt: string; competition: string; homeTeam: string; awayTeam: string; homeTeamId: number; awayTeamId: number; homeScore: number; awayScore: number }>[];
}>;

/** Orient totals to the drawn fixture, while preserving each meeting's actual venue order. */
export function snapshotHeadToHead(raw: unknown, homeTeamId: number, awayTeamId: number, asOf: Date): HeadToHeadSnapshot | undefined {
  const parsed = response.safeParse(raw);
  if (!parsed.success || homeTeamId === awayTeamId) return undefined;
  const seen = new Set<number>();
  const meetings = parsed.data.matches.flatMap((item) => {
    const result = match.safeParse(item);
    if (!result.success) return [];
    const m = result.data;
    if (m.status !== "FINISHED" || new Date(m.utcDate) >= asOf || m.score.fullTime.home === null || m.score.fullTime.away === null) return [];
    if (!((m.homeTeam.id === homeTeamId && m.awayTeam.id === awayTeamId) || (m.homeTeam.id === awayTeamId && m.awayTeam.id === homeTeamId))) return [];
    if (seen.has(m.id)) return [];
    seen.add(m.id);
    return [{ id: m.id, kickoffAt: m.utcDate, competition: m.competition.name, homeTeam: m.homeTeam.name, awayTeam: m.awayTeam.name, homeTeamId: m.homeTeam.id, awayTeamId: m.awayTeam.id, homeScore: m.score.fullTime.home, awayScore: m.score.fullTime.away }];
  }).sort((a, b) => Date.parse(b.kickoffAt) - Date.parse(a.kickoffAt)).slice(0, 5);
  if (!meetings.length) return undefined;
  let homeWins = 0, draws = 0, awayWins = 0;
  for (const m of meetings) {
    const difference = (m.homeScore - m.awayScore) * (m.homeTeamId === homeTeamId ? 1 : -1);
    if (difference > 0) homeWins++; else if (difference < 0) awayWins++; else draws++;
  }
  return { asOf: asOf.toISOString(), homeTeamId, awayTeamId, homeWins, draws, awayWins, meetings };
}
