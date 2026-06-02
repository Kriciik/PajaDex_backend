import { eq } from "drizzle-orm";
import { db } from "../db";
import { User, usersTable } from "../db/schema";

export async function getUserData(username: string): Promise<User> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
