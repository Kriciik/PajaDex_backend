CREATE TABLE "cards_groups" (
	"card_id" varchar NOT NULL,
	"group_id" uuid NOT NULL,
	CONSTRAINT "id" PRIMARY KEY("card_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(20)
);
--> statement-breakpoint
ALTER TABLE "collection" DROP CONSTRAINT "collection_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "collection" DROP CONSTRAINT "collection_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "cards_groups" ADD CONSTRAINT "cards_groups_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards_groups" ADD CONSTRAINT "cards_groups_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;