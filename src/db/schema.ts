import {
  pgEnum,
  timestamp,
  integer,
  pgTable,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";

export const conditionEnum = pgEnum("condition", [
  "Mint",
  "Near Mint",
  "Excellent",
  "Good",
  "Light Played",
  "Played",
  "Poor",
]);

export const categoryEnum = pgEnum("category", [
  "Pokemon",
  "Trainer",
  "Energy",
]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cardsTable = pgTable("cards", {
  id: varchar({ length: 50 }).primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  setName: varchar({ length: 60 }).notNull(),
  type: varchar({ length: 50 }).array(),
  category: categoryEnum(),
});

export const collectionsTable = pgTable("collection", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  cardId: varchar("card_id")
    .references(() => cardsTable.id)
    .notNull(),
  condition: conditionEnum(), // maybe wont be used, idk
  foilType: varchar({ length: 50 }),
  quantity: integer().notNull(),
});

export type User = typeof usersTable.$inferInsert;
export type Card = typeof cardsTable.$inferInsert;
export type Collection = typeof collectionsTable.$inferInsert;
