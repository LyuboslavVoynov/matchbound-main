-- Repair migration for databases that recorded 0012 before its generated
-- full-schema SQL was replaced with the intended additive migration.
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "provider_competition_code" text;
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "provider_area_id" text;
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "provider_area_code" text;
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "emblem_url" text;
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "area_flag_url" text;

ALTER TABLE "fixtures" ADD COLUMN IF NOT EXISTS "home_team_provider_id" text;
ALTER TABLE "fixtures" ADD COLUMN IF NOT EXISTS "away_team_provider_id" text;
ALTER TABLE "fixtures" ADD COLUMN IF NOT EXISTS "home_team_crest_url" text;
ALTER TABLE "fixtures" ADD COLUMN IF NOT EXISTS "away_team_crest_url" text;
