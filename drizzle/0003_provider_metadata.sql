ALTER TABLE "competitions" ADD COLUMN "provider" text;
ALTER TABLE "competitions" ADD COLUMN "provider_competition_id" text;
CREATE UNIQUE INDEX "competitions_provider_competition_unique" ON "competitions" ("provider", "provider_competition_id") WHERE "provider" IS NOT NULL;
ALTER TABLE "fixtures" ADD COLUMN "provider_status" text;
ALTER TABLE "fixtures" ADD COLUMN "source_updated_at" timestamptz;
