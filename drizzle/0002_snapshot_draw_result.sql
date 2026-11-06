ALTER TABLE "fixtures" ADD COLUMN "timezone" text NOT NULL DEFAULT 'Europe/London';
ALTER TABLE "draws" ADD COLUMN "result_snapshot" jsonb;
UPDATE "draws" d SET "result_snapshot" = jsonb_build_object(
  'competition', c.name, 'country', c.country, 'homeTeam', f.home_team, 'awayTeam', f.away_team,
  'kickoffDate', f.kickoff_date, 'kickoffAt', f.kickoff_at, 'timezone', f.timezone,
  'stadium', f.stadium, 'city', f.city, 'officialTicketUrl', f.official_ticket_url
) FROM "fixtures" f JOIN "competitions" c ON c.id = f.competition_id WHERE d.fixture_id = f.id;
ALTER TABLE "draws" ALTER COLUMN "result_snapshot" SET NOT NULL;
