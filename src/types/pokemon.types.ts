// duplicate this file to frontend and export the type there as well

export interface CleanCard {
  id: string;
  name: string;
  image: string;
  setName: string;
  type: string[];
  category: "Pokemon" | "Trainer" | "Energy";
}

export interface DetailedCard extends CleanCard {
  abilities: {
    cost?: string[];
    name: string;
    effect?: string;
    damage?: string | number;
  }[];
  rarity: string;
  evolvesFrom: string;
  description: string;
  illustrator: string;
}
