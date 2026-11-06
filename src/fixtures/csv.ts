import { z } from "zod";

export const fixtureCsvRow = z.object({
  source_id: z.string().min(1), competition: z.string().min(1), competition_country: z.string().min(1),
  provider_competition_code: z.string().min(1).optional().or(z.literal("")), competition_emblem_url: z.string().url().optional().or(z.literal("")), country_flag_url: z.string().url().optional().or(z.literal("")),
  kickoff_at: z.string().datetime({ offset: true }), kickoff_date: z.string().date(), timezone: z.string().min(1),
  home_team: z.string().min(1), away_team: z.string().min(1), city: z.string().min(1), stadium: z.string().min(1),
  home_team_provider_id: z.string().min(1).optional().or(z.literal("")), away_team_provider_id: z.string().min(1).optional().or(z.literal("")), home_team_crest_url: z.string().url().optional().or(z.literal("")), away_team_crest_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["confirmed", "tentative", "postponed", "cancelled"]), official_ticket_url: z.string().url().optional().or(z.literal("")),
});
export type FixtureCsvRow = z.infer<typeof fixtureCsvRow>;

/** RFC4180-style parser sufficient for headered fixture feeds, including quoted commas. */
export function parseFixtureCsv(contents: string): FixtureCsvRow[] {
  const rows = parseCsv(contents.trim());
  if (rows.length < 2) return [];
  const [headers, ...data] = rows;
  return data.filter((row) => row.some(Boolean)).map((row, index) => {
    const record = Object.fromEntries(headers.map((header, column) => [header, row[column] ?? ""]));
    return fixtureCsvRow.parse(record, { path: [index + 2] });
  });
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [[]]; let field = ""; let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i]; const next = input[i + 1];
    if (char === '"' && quoted && next === '"') { field += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { rows.at(-1)!.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") i++; rows.at(-1)!.push(field); rows.push([]); field = ""; }
    else field += char;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field");
  rows.at(-1)!.push(field); return rows;
}
