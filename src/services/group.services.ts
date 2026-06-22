import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { cardsGroupsTable, groupTable } from "../db/schema";

export async function getGroupByNameAndUser(name: string, userId: string) {
  const [group] = await db
    .select()
    .from(groupTable)
    .where(and(eq(groupTable.name, name), eq(groupTable.userId, userId)))
    .limit(1);

  return group || null;
}

export async function createNewGroup(name: string, userId: string, color?: string) {
  const [newGroup] = await db
    .insert(groupTable)
    .values({
      name,
      userId,
      color,
    })
    .returning();

  return newGroup;
}

export async function getGroupsByUserId(userId: string) {
  return await db.select().from(groupTable).where(eq(groupTable.userId, userId));
}

export async function syncGroupCards(groupId: string, cardIds: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(cardsGroupsTable).where(eq(cardsGroupsTable.groupId, groupId));

    if (cardIds.length > 0) {
      const valuesToInsert = cardIds.map((cardId) => ({
        groupId: groupId,
        cardId: cardId,
      }));

      await tx.insert(cardsGroupsTable).values(valuesToInsert);
    }
  });
}

export async function getCardIdsByGroupId(groupId: string) {
  return await db
    .select({ cardId: cardsGroupsTable.cardId })
    .from(cardsGroupsTable)
    .where(eq(cardsGroupsTable.groupId, groupId));
}

export async function deleteGroupById(groupId: string, userId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(cardsGroupsTable).where(eq(cardsGroupsTable.groupId, groupId));
    await tx
      .delete(groupTable)
      .where(and(eq(groupTable.id, groupId), eq(groupTable.userId, userId)));
  });
}
