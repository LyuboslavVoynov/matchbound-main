ALTER TABLE "venues" ADD COLUMN "reviewed" boolean NOT NULL DEFAULT false;

-- Only records seeded from Matchbound's reviewed provider registry are production eligible.
UPDATE "venues" SET "reviewed" = true WHERE "provider" = 'football-data';
