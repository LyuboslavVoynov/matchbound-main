CREATE TABLE "beer_product_artwork" (
	"product_id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"kind" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beer_product_artwork" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "beer_product_artwork" ADD CONSTRAINT "beer_product_artwork_product_id_beer_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."beer_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beer_product_artwork" ADD CONSTRAINT "beer_product_artwork_asset_id_creative_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creative_assets"("id") ON DELETE no action ON UPDATE no action;