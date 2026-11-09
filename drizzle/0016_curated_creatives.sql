CREATE TYPE "public"."creative_approval" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."creative_subject" AS ENUM('country', 'city', 'stadium');--> statement-breakpoint
CREATE TABLE "creative_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"object_key" text NOT NULL,
	"image_url" text,
	"content_sha256" text NOT NULL,
	"title" text NOT NULL,
	"creator" text NOT NULL,
	"source_page_url" text NOT NULL,
	"original_url" text NOT NULL,
	"license_name" text NOT NULL,
	"license_url" text NOT NULL,
	"attribution" text NOT NULL,
	"transformation_note" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"bytes" integer NOT NULL,
	"focal_x" integer DEFAULT 50 NOT NULL,
	"focal_y" integer DEFAULT 50 NOT NULL,
	"approval_status" "creative_approval" DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"published_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creative_placements" (
	"subject_key" text PRIMARY KEY NOT NULL,
	"subject_type" "creative_subject" NOT NULL,
	"country" text NOT NULL,
	"city" text,
	"stadium" text,
	"asset_id" text NOT NULL,
	"alt" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creative_placements" ADD CONSTRAINT "creative_placements_asset_id_creative_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creative_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "creative_assets_object_key_unique" ON "creative_assets" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "creative_assets_approved_idx" ON "creative_assets" USING btree ("approval_status","active","published_at");--> statement-breakpoint
CREATE INDEX "creative_placements_asset_idx" ON "creative_placements" USING btree ("asset_id");
--> statement-breakpoint
ALTER TABLE "creative_assets" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "creative_placements" ENABLE ROW LEVEL SECURITY;
