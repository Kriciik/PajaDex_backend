import {
  pgEnum,
  timestamp,
  integer,
  pgTable,
  varchar,
  uuid,
  primaryKey,
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
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  cardId: varchar("card_id")
    .references(() => cardsTable.id, { onDelete: "cascade" })
    .notNull(),
  condition: conditionEnum(), // maybe wont be used, idk
  foilType: varchar("foil_type", { length: 50 }),
});

export const groupTable = pgTable("group", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  color: varchar({ length: 20 }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const cardsGroupsTable = pgTable(
  "cards_groups",
  {
    cardId: varchar("card_id")
      .references(() => cardsTable.id, { onDelete: "cascade" })
      .notNull(),
    groupId: uuid("group_id")
      .references(() => groupTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ name: "id", columns: [table.cardId, table.groupId] })],
);

export type User = typeof usersTable.$inferInsert;
export type Card = typeof cardsTable.$inferInsert;
export type Collection = typeof collectionsTable.$inferInsert;
