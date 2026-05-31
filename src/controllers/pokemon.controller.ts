import { Request, Response } from "express";
import { getSingleCard } from "../services/pokemon.services";
import { CleanCard } from "../types/pokemon.types";
import { handleError } from "../utils/errors";

type CardParams = {
  id: string;
};

type CardResponse = CleanCard | { error: string };

export async function getCard(
  req: Request<CardParams>,
  res: Response<CardResponse>,
) {
  try {
    const cardId: string = req.params.id;

    if (!cardId) return res.status(400).json({ error: "Card ID is required" });

    const card: CleanCard = await getSingleCard(cardId);

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: handleError(error) });
  }
}
