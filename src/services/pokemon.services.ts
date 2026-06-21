import TCGdex, { Query } from "@tcgdex/sdk";
import { CleanCard, DetailedCard } from "../types/pokemon.types";
import { db } from "../db";
import { cardsGroupsTable, cardsTable, collectionsTable, groupTable } from "../db/schema";
import { and, count, eq, ilike, inArray, or } from "drizzle-orm";

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
  groupId?: string,
  onlyOwned?: boolean,
): Promise<{ cards: CleanCard[]; totalItems: number }> {
  let cardIds: string[] = [];
  let totalItems: number = 0;

  const offset = (page - 1) * limit;

  const tcgTypes = [
    "grass",
    "fire",
    "water",
    "lightning",
    "psychic",
    "fighting",
    "darkness",
    "metal",
    "dragon",
    "fairy",
    "colorless",
  ];
  const cleanSearch = searchName ? searchName.trim() : "";
  const isTypeSearch = tcgTypes.includes(cleanSearch.toLowerCase());
  const capitalizedType = cleanSearch.charAt(0).toUpperCase() + cleanSearch.slice(1).toLowerCase();

  if (groupId) {
    const whereClause = and(
      eq(cardsGroupsTable.groupId, groupId),
      cleanSearch !== ""
        ? or(
            ilike(cardsTable.name, `%${cleanSearch}%`),
            ilike(cardsTable.type, `%${cleanSearch}%`), // Hledání v sloupci typu
          )
        : undefined,
    );

    const dbResult = await db
      .select({ id: cardsGroupsTable.cardId })
      .from(cardsGroupsTable)
      .innerJoin(cardsTable, eq(cardsGroupsTable.cardId, cardsTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    cardIds = dbResult.map((row) => row.id);

    const [countResult] = await db
      .select({ value: count() })
      .from(cardsGroupsTable)
      .innerJoin(cardsTable, eq(cardsGroupsTable.cardId, cardsTable.id))
      .where(whereClause);

    totalItems = countResult?.value || 0;

    if (cardIds.length === 0) return { cards: [], totalItems: 0 };
  } else if (onlyOwned) {
    const whereClause = and(
      eq(collectionsTable.userId, userId),
      cleanSearch !== ""
        ? or(ilike(cardsTable.name, `%${cleanSearch}%`), ilike(cardsTable.type, `%${cleanSearch}%`))
        : undefined,
    );

    const dbResult = await db
      .select({ id: collectionsTable.cardId })
      .from(collectionsTable)
      .innerJoin(cardsTable, eq(collectionsTable.cardId, cardsTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    cardIds = dbResult.map((row) => row.id);
    const [countResult] = await db
      .select({ value: count() })
      .from(collectionsTable)
      .innerJoin(cardsTable, eq(collectionsTable.cardId, cardsTable.id))
      .where(whereClause);

    totalItems = countResult?.value || 0;

    if (cardIds.length === 0) return { cards: [], totalItems: 0 };
  } else {
    let query: Query = Query.create().paginate(page, limit);

    if (cleanSearch !== "") {
      if (isTypeSearch) {
        // Pokud text odpovídá typu, filtrujeme pole 'types' v API
        query = query.equal("types", capitalizedType);
      } else {
        // Jinak standardně vyhledáváme podle jména
        query = query.contains("name", cleanSearch);
      }
    }

    const list = await tcgdex.card.list(query);
    if (!list) {
      throw new Error("Failed to fetch card list");
    }

    cardIds = list.map((card) => card.id);

    let countQuery = Query.create();
    if (cleanSearch !== "") {
      countQuery = isTypeSearch
        ? countQuery.equal("types", capitalizedType)
        : countQuery.contains("name", cleanSearch);
    }
    const cardsCount = await tcgdex.card.list(countQuery);
    totalItems = cardsCount.length;
  }

  const userOwnedRows = await db
    .select({ cardId: collectionsTable.cardId })
    .from(collectionsTable)
    .where(eq(collectionsTable.userId, userId));

  const ownedCardIds = new Set(userOwnedRows.map((row) => row.cardId));

  const promises = cardIds.map(async (id) => {
    try {
      const rawCard = await tcgdex.card.get(id);
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
      console.error(`Failed to fetch details for card ID ${id}:`, error);
      return;
    }
  });

  const results = await Promise.all(promises);
  const cards = results.filter((card): card is CleanCard => card !== undefined);

  return { cards, totalItems };
}

export async function addCardToCollection(userId: string, cardData: CleanCard): Promise<Object> {
  const { id: cardId, name, image, setName, type, category } = cardData;

  return await db.transaction(async (tx) => {
    const [existingCard] = await tx
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    if (!existingCard) {
      await tx.insert(cardsTable).values({
        id: cardId,
        name,
        image,
        setName,
        type,
        category,
      });
    }

    const [existingCollectionItem] = await tx
      .select()
      .from(collectionsTable)
      .where(and(eq(collectionsTable.userId, userId), eq(collectionsTable.cardId, cardId)))
      .limit(1);

    if (existingCollectionItem) {
      await db
        .delete(collectionsTable)
        .where(and(eq(collectionsTable.userId, userId), eq(collectionsTable.cardId, cardId)));

      const userGroupIdsSubquery = tx
        .select({ id: groupTable.id })
        .from(groupTable)
        .where(eq(groupTable.userId, userId));

      await tx
        .delete(cardsGroupsTable)
        .where(
          and(
            eq(cardsGroupsTable.cardId, cardId),
            inArray(cardsGroupsTable.groupId, userGroupIdsSubquery),
          ),
        );
      return { isOwned: false };
    } else {
      await tx.insert(collectionsTable).values({
        userId,
        cardId,
      });
      return { isOwned: true };
    }
  });
}
