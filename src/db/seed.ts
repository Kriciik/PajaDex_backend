import { eq } from "drizzle-orm";
import { db } from ".";
import { roleEnum, usersTable } from "./schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const usersData = [
  {
    username: "admin",
    email: "admin@mail.com",
    password: "secure123654",
    userRole: "admin",
  },
  {
    username: "paju",
    email: "TODO:",
    password: "0607",
    userRole: "user",
  },
  {
    username: "guest",
    email: "guest@email.com",
    password: "123654",
    userRole: "user",
  },
];

export async function seed() {
  try {
    if (!usersData || usersData.length === 0) {
      console.log("No users to seed");
      return;
    }

    for (const user of usersData) {
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      user.password = hashedPassword;
    }

    for (const user of usersData) {
      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, user.username))
        .limit(1);
      if (existingUser) {
        return;
      }
      const userInsert = await db.insert(usersTable).values({
        username: user.username,
        email: user.email,
        password: user.password,
        userRole: user.userRole as typeof usersTable.$inferInsert.userRole,
      });
      console.log("User created ", userInsert.fields);
    }
  } catch (error) {
    console.error("Error seeding database", error);
  }
}

seed();
