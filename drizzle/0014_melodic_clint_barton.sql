CREATE TYPE "public"."place_media_subject" AS ENUM('city', 'stadium');--> statement-breakpoint
CREATE TABLE "place_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" "place_media_subject" NOT NULL,
	"subject_key" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"stadium" text,
	"image_url" text NOT NULL,
	"source_name" text NOT NULL,
	"source_page_url" text NOT NULL,
	"author" text NOT NULL,
	"licence_name" text NOT NULL,
	"licence_url" text NOT NULL,
	"attribution" text NOT NULL,
	"focal_point" text DEFAULT 'center' NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "place_media_subject_unique" ON "place_media" USING btree ("subject_type","subject_key");--> statement-breakpoint
CREATE INDEX "place_media_lookup_idx" ON "place_media" USING btree ("subject_type","subject_key","active");