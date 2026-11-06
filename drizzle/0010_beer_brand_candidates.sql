CREATE TYPE "beer_brand_candidate_status" AS ENUM ('pending', 'approved', 'rejected');
CREATE TABLE "beer_brand_candidates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "country_beer_brand_id" uuid NOT NULL REFERENCES "country_beer_brands"("id"),
  "provider" text NOT NULL,
  "provider_brewer_id" text NOT NULL,
  "provider_brewer_name" text NOT NULL,
  "provider_catalog_verified" boolean NOT NULL,
  "provider_brewer_verified" boolean NOT NULL,
  "provider_last_modified" timestamptz NOT NULL,
  "discovered_at" timestamptz NOT NULL DEFAULT now(),
  "status" "beer_brand_candidate_status" NOT NULL DEFAULT 'pending',
  "reviewed_at" timestamptz,
  "review_note" text
);
CREATE UNIQUE INDEX "beer_brand_candidates_brand_provider_unique" ON "beer_brand_candidates" ("country_beer_brand_id", "provider");
CREATE INDEX "beer_brand_candidates_status_idx" ON "beer_brand_candidates" ("status");
