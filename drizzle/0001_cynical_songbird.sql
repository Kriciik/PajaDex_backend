CREATE TYPE "public"."condition" AS ENUM('Mint', 'Near Mint', 'Excellent', 'Good', 'Light Played', 'Played', 'Poor');--> statement-breakpoint
CREATE TYPE "public"."foil_type" AS ENUM('common', 'uncommon', 'rare', 'energy common', 'holofoil rare', 'reverse holo', 'reverse foil', 'reverse holofoil', 'full art', 'ultra rare', 'secret rare', 'promo', 'mega');--> statement-breakpoint
CREATE TABLE "cards" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"image" varchar(255) NOT NULL,
	"setName" varchar(60) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"card_id" varchar,
	"condition" "condition",
	"foilType" "foil_type",
	"quantity" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "name" TO "username";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" "cal::local_datetime" DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "age";