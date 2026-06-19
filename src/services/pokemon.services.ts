import TCGdex, { Query } from "@tcgdex/sdk";
import { CleanCard, DetailedCard } from "../types/pokemon.types";
import { db } from "../db";
import { cardsTable, collectionsTable } from "../db/schema";
import { and, eq } from "drizzle-orm";

const tcgdex = new TCGdex("en");

const IMAGE_PLACEHOLDER = "https://assets.tcgdex.net/en/swsh/swsh1/65/high.webp"; //TODO: Change later
const TYPE_PLACEHOLDER = ["?"];

export async function getDetailedCard(id: string): Promise<DetailedCard> {
  const rawCard = await tcgdex.card.get(id);

  if (!rawCard) {
    throw new Error(`Card with ID ${id} not found`);
  }
  const validCategories = ["Pokemon", "Trainer", "Energy"];
  type CardCategory = "Pokemon" | "Trainer" | "Energy";

  const category: CardCategory = validCategories.includes(rawCard.category as CardCategory)
    ? (rawCard.category as CardCategory)
    : "Pokemon";

  const detailedCard: DetailedCard = {
    id: rawCard.id,
    name: rawCard.name,
    image: rawCard.getImageURL("high") || IMAGE_PLACEHOLDER,
    setName: rawCard.set.name,
    type: rawCard.types || TYPE_PLACEHOLDER,
    category: category,
    abilities: rawCard.attacks || [],
    rarity: rawCard.rarity,
    evolvesFrom: rawCard.evolveFrom || "",
    description: rawCard.description || "",
    illustrator: rawCard.illustrator || "",
  };

  return detailedCard;
}
export async function getPaginatedList(
  page: number,
  limit: number,
  userId: string,
  searchName?: string,
): Promise<CleanCard[]> {
  let query: Query = Query.create().paginate(page, limit);

  if (searchName && searchName.trim() !== "") {
    query = query.contains("name", searchName.trim());
  }

  const list = await tcgdex.card.list(query);

  if (!list) {
    throw new Error("Failed to fetch card list");
  }
  const cardIds = list.map((card) => card.id);
  const userOwnedRows = await db
    .select({ cardId: collectionsTable.cardId })
    .from(collectionsTable)
    .where(eq(collectionsTable.userId, userId));

  const ownedCardIds = new Set(userOwnedRows.map((row) => row.cardId));

  const promises = list.map(async (card) => {
    try {
      const rawCard = await tcgdex.card.get(card.id);
      if (!rawCard) {
        return;
      }

      return {
        id: rawCard.id,
        name: rawCard.name,
        image: rawCard.getImageURL("high") || IMAGE_PLACEHOLDER,
        setName: rawCard.set.name,
        type: rawCard.types || TYPE_PLACEHOLDER,
        category: rawCard.category,
        isOwned: ownedCardIds.has(rawCard.id),
      } as CleanCard;
    } catch (error) {
      console.error(`Failed to fetch details for card ID ${card.id}:`, error);
      return;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((card): card is CleanCard => card !== undefined);
}

export async function addCardToCollection(userId: string, cardData: CleanCard): Promise<Object> {
  const { id: cardId, name, image, setName, type, category } = cardData;

  const [existingCard] = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .limit(1);

  if (!existingCard) {
    await db.insert(cardsTable).values({
      id: cardId,
      name,
      image,
      setName,
      type,
      category,
    });
  }

  const [existingCollectionItem] = await db
    .select()
    .from(collectionsTable)
    .where(and(eq(collectionsTable.userId, userId), eq(collectionsTable.cardId, cardId)))
    .limit(1);

  if (existingCollectionItem) {
    await db
      .delete(collectionsTable)
      .where(and(eq(collectionsTable.userId, userId), eq(collectionsTable.cardId, cardId)));
    return { isOwned: false };
  } else {
    await db.insert(collectionsTable).values({
      userId,
      cardId,
    });
    return { isOwned: true };
  }
}
