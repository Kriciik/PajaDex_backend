import { NextFunction, Request, Response } from "express";
import {
  addCardToCollection,
  getDetailedCard,
  getPaginatedList,
} from "../services/pokemon.services";
import { CleanCard, DetailedCard } from "../types/pokemon.types";

import TCGdex, { Query } from "@tcgdex/sdk";

type CardParams = {
  id: string;
};
type CardResponse = DetailedCard | { error: string };

const tcgdex = new TCGdex("en");

export async function getCard(
  req: Request<CardParams>,
  res: Response<CardResponse>,
  next: NextFunction,
) {
  try {
    const cardId: string = req.params.id;

    if (!cardId) return res.status(400).json({ error: "Card ID is required" });

    const card: DetailedCard = await getDetailedCard(cardId);

    if (!card) return res.status(404).json({ error: "Card not found" });

    res.json(card);
  } catch (error) {
    next(error);
  }
}

// TODO: set constant max limit for pagination
export async function getCardList(req: Request, res: Response, next: NextFunction) {
  try {
    const queryPage = req.query.page ? parseInt(req.query.page as string) : 1;
    const queryLimit = req.query.limit ? parseInt(req.query.limit as string) : 12;
    const queryName = req.query.name ? req.query.name.toString() : "";

    //TODO: reformat this
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (isNaN(queryPage) || isNaN(queryLimit) || queryPage < 1 || queryLimit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const cardsList: CleanCard[] = await getPaginatedList(queryPage, queryLimit, userId, queryName);

    let cardsCount = await tcgdex.card.list();
    if (queryName) {
      cardsCount = await tcgdex.card.list(Query.create().contains("name", queryName.trim()));
    }

    const totalItems = cardsCount.length;
    const totalPages = Math.ceil(totalItems / queryLimit);

    res.json({
      data: cardsList,
      meta: {
        totalItems,
        totalPages,
        page: queryPage,
        limit: queryLimit,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function postCardToCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const cardData: CleanCard = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. User ID missing." });
    }

    if (!cardData || !cardData.id) {
      return res.status(400).json({ error: "Bad Request. Missing card data." });
    }

    // Volání vaší servisní funkce
    const result = await addCardToCollection(userId, cardData);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
