CREATE TABLE "beer_breweries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country_code" text NOT NULL,
	"origin_nation" text NOT NULL,
	"source_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beer_products" (
	"id" text PRIMARY KEY NOT NULL,
	"brewery_id" text NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"style" text,
	"abv_basis_points" integer,
	"source_url" text NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"approval_status" "beer_brand_approval_status" DEFAULT 'pending' NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beer_products" ADD CONSTRAINT "beer_products_brewery_id_beer_breweries_id_fk" FOREIGN KEY ("brewery_id") REFERENCES "public"."beer_breweries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "beer_product_brewery_name_idx" ON "beer_products" USING btree ("brewery_id","normalized_name");
ALTER TABLE "beer_breweries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "beer_products" ENABLE ROW LEVEL SECURITY;
