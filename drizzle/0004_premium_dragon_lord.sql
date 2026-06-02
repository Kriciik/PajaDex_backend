ALTER TYPE "public"."role" RENAME TO "user_role";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "setName" TO "set_name";--> statement-breakpoint
ALTER TABLE "collection" RENAME COLUMN "foilType" TO "foil_type";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "role" TO "user_role";