const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

export type FootballDataCompetition = Readonly<{
  id: number;
  code: string | null;
  name: string;
  type: "LEAGUE" | "CUP" | string;
  area: { name: string };
}>;

export type FootballDataMatch = Readonly<{
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  area?: { id: number; name: string; code: string | null; flag: string | null };
  homeTeam: { id: number; name: string; crest: string | null };
  awayTeam: { id: number; name: string; crest: string | null };
  competition: { id: number; code: string | null; name: string; emblem: string | null };
}>;

export type FootballDataTeam = Readonly<{
  id: number;
  name: string;
  shortName: string | null;
  venue: string | null;
  address: string | null;
}>;

type FootballDataResponse<T> = T & { message?: string };

/** Server-only client for football-data.org. Never expose its token to the browser. */
export function createFootballDataClient(
  token = process.env.FOOTBALL_DATA_API_KEY,
  fetcher: typeof fetch = fetch,
) {
  if (!token) throw new Error("FOOTBALL_DATA_API_KEY is required");
  const authToken = token;

  async function request<T>(path: string): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetcher(`${FOOTBALL_DATA_BASE_URL}${path}`, {
        headers: { "X-Auth-Token": authToken, Accept: "application/json" },
        cache: "no-store",
      });
      if (response.ok) return response.json() as Promise<T>;
      if (response.status === 429 && attempt < 2) {
        const retryAfterSeconds = Number(response.headers.get("retry-after"));
        const waitMs = Number.isFinite(retryAfterSeconds) ? Math.min(Math.max(retryAfterSeconds * 1000, 1_000), 60_000) : 10_000;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      // Do not include headers, tokens, or upstream response bodies in errors.
      throw new Error(`football-data request failed (${response.status})`);
    }
    throw new Error("football-data request exhausted its retry budget");
  }

  return {
    /** Returns every competition the configured plan may access. */
    async getAvailableCompetitions(): Promise<FootballDataCompetition[]> {
      const response = await request<FootballDataResponse<{ competitions: FootballDataCompetition[] }>>("/competitions");
      return response.competitions;
    },
    /** Returns the selected competition's fixtures for a calendar season year. */
    async getCompetitionMatches(competitionCode: string, season: number): Promise<FootballDataMatch[]> {
      const response = await request<FootballDataResponse<{ matches: FootballDataMatch[] }>>(`/competitions/${encodeURIComponent(competitionCode)}/matches?season=${season}`);
      return response.matches;
    },
    async getCompetitionTeams(competitionCode: string, season?: number): Promise<FootballDataTeam[]> {
      const response = await request<FootballDataResponse<{ teams: FootballDataTeam[] }>>(`/competitions/${encodeURIComponent(competitionCode)}/teams${season === undefined ? "" : `?season=${season}`}`);
      return response.teams;
    },
  };
}
