CREATE TABLE "venues" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "provider" text NOT NULL,
  "provider_team_id" text NOT NULL,
  "stadium" text NOT NULL,
  "city" text NOT NULL,
  "country" text NOT NULL,
  "timezone" text NOT NULL,
  "address" text,
  "verified_at" timestamptz NOT NULL DEFAULT now(),
  "active" boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX "venues_provider_team_unique" ON "venues" ("provider", "provider_team_id");
ALTER TABLE "fixtures" ADD COLUMN "venue_id" uuid REFERENCES "venues"("id");
