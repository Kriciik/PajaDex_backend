CREATE TYPE "public"."category" AS ENUM('Pokemon', 'Trainer', 'Energy');--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "card_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "foilType" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "type" varchar(50)[];--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "category" "category";--> statement-breakpoint
DROP TYPE "public"."foil_type";