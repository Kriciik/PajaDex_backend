import { db } from ".";
import { usersTable } from "./schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const usersData = [
  {
    username: "admin",
    email: "admin@mail.com",
    password: "123654",
  },
  {
    username: "paju",
    email: "TODO:",
    password: "0607",
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
    });

    console.log("Admin user created", adminUser.fields);
  } catch (error) {
    console.error("Error seeding database", error);
  }
}

seed();
