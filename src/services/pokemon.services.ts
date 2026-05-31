import TCGdex, { Card } from "@tcgdex/sdk";
import { CleanCard } from "../types/pokemon.types";
const tcgdex = new TCGdex("en");

export async function getSingleCard(id: string): Promise<CleanCard> {
  const IMAGE_PLACEHOLDER = "https://via.placeholder.com/150"; //TODO: Change later
  const TYPE_PLACEHOLDER = ["?"];

  const rawCard = await tcgdex.card.get(id);

  if (!rawCard) {
    throw new Error(`Card with ID ${id} not found`);
  }

  const cleanCard = {
    id: rawCard.id,
    name: rawCard.name,
    image: rawCard.image || IMAGE_PLACEHOLDER,
    setName: rawCard.set.name,
    type: rawCard.types || TYPE_PLACEHOLDER,
    category: rawCard.category,
  };

  return cleanCard;
}
