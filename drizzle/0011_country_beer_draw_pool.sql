CREATE TYPE "beer_brand_approval_status" AS ENUM ('approved', 'pending', 'rejected');

ALTER TABLE "country_beer_brands"
  ADD COLUMN "approval_status" "beer_brand_approval_status" NOT NULL DEFAULT 'approved';

DROP INDEX "country_beer_brands_country_unique";
CREATE UNIQUE INDEX "country_beer_brands_country_brand_unique" ON "country_beer_brands" ("country_code", "brand_name");
CREATE INDEX "country_beer_brands_draw_pool_idx" ON "country_beer_brands" ("country_code", "approval_status", "active", "valid_until");
