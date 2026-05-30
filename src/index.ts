import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { usersTable, User } from "./db/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const user: User = {
    name: "John Doe",
    age: 30,
    email: "john@example.com",
  };

  await db.insert(usersTable).values(user);
  console.log("New user created!");

  const users = await db.select().from(usersTable);
  console.log("All users:", users);

  await db
    .update(usersTable)
    .set({ age: 31 })
    .where(eq(usersTable.email, user.email));
  console.log("User info updated!");

  await db.delete(usersTable).where(eq(usersTable.email, user.email));
  console.log("User deleted!");
}

main();
