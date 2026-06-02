import { NextFunction, Request, Response } from "express";
import { getPaginatedList, getSingleCard } from "../services/pokemon.services";
import { CleanCard } from "../types/pokemon.types";

import TCGdex from "@tcgdex/sdk";

type CardParams = {
  id: string;
};
type CardResponse = CleanCard | { error: string };

const tcgdex = new TCGdex("en");

export async function getCard(
  req: Request<CardParams>,
  res: Response<CardResponse>,
  next: NextFunction,
) {
  try {
    const cardId: string = req.params.id;

    if (!cardId) return res.status(400).json({ error: "Card ID is required" });

    const card: CleanCard = await getSingleCard(cardId);

    res.json(card);
  } catch (error) {
    next(error);
  }
}

// TODO: set constant max limit for pagination
export async function getCardList(req: Request, res: Response, next: NextFunction) {
  try {
    const queryPage = req.query.page ? parseInt(req.query.page as string) : 1;
    const queryLimit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (isNaN(queryPage) || isNaN(queryLimit) || queryPage < 1 || queryLimit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const cardsList: CleanCard[] = await getPaginatedList(queryPage, queryLimit);

    const cardsCount = await tcgdex.card.list();
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
