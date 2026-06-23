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
    const firstUser = usersData[0]!;

    const adminUser = await db.insert(usersTable).values({
      username: firstUser.username,
      email: firstUser.email,
      password: firstUser.password,
      userRole: firstUser.userRole as typeof usersTable.$inferInsert.userRole,
    });

    console.log("Admin user created", adminUser.fields);
  } catch (error) {
    console.error("Error seeding database", error);
  }
}

seed();
