import TCGdex, { Card, CardResume, CardResumeModel, Query } from "@tcgdex/sdk";
import { CleanCard } from "../types/pokemon.types";
const tcgdex = new TCGdex("en");

const IMAGE_PLACEHOLDER = "https://via.placeholder.com/150"; //TODO: Change later
const TYPE_PLACEHOLDER = ["?"];

export async function getSingleCard(id: string): Promise<CleanCard> {
  const rawCard = await tcgdex.card.get(id);

  if (!rawCard) {
    throw new Error(`Card with ID ${id} not found`);
  }
  const cleanCard = {
    id: rawCard.id,
    name: rawCard.name,
    image: rawCard.getImageURL("low") || IMAGE_PLACEHOLDER,
    setName: rawCard.set.name,
    type: rawCard.types || TYPE_PLACEHOLDER,
    category: rawCard.category,
  };

  return cleanCard;
}

export async function getPaginatedList(page: number, limit: number): Promise<CleanCard[]> {
  const query: Query = Query.create().paginate(page, limit);
  const list = await tcgdex.card.list(query);

  if (!list) {
    throw new Error("Failed to fetch card list");
  }

  const promises = list.map(async (card) => {
    try {
      const rawCard = await tcgdex.card.get(card.id);
      if (!rawCard) {
        return;
      }

      return {
        id: rawCard.id,
        name: rawCard.name,
        image: rawCard.getImageURL("low") || IMAGE_PLACEHOLDER,
        setName: rawCard.set.name,
        type: rawCard.types || TYPE_PLACEHOLDER,
        category: rawCard.category,
      } as CleanCard;
    } catch (error) {
      console.error(`Failed to fetch details for card ID ${card.id}:`, error);
      return;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((card): card is CleanCard => card !== null);
}
