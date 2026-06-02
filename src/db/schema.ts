import { pgEnum, timestamp, integer, pgTable, varchar, uuid } from "drizzle-orm/pg-core";
import e from "express";

export const conditionEnum = pgEnum("condition", [
  "Mint",
  "Near Mint",
  "Excellent",
  "Good",
  "Light Played",
  "Played",
  "Poor",
]);

export const categoryEnum = pgEnum("category", ["Pokemon", "Trainer", "Energy"]);

export const roleEnum = pgEnum("user_role", ["user", "admin"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userRole: roleEnum("user_role").default("user").notNull(),
});

export const cardsTable = pgTable("cards", {
  id: varchar({ length: 50 }).primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  setName: varchar("set_name", { length: 60 }).notNull(),
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
  foilType: varchar("foil_type", { length: 50 }),
  quantity: integer().notNull(),
});

export type User = typeof usersTable.$inferInsert;
export type Card = typeof cardsTable.$inferInsert;
export type Collection = typeof collectionsTable.$inferInsert;
