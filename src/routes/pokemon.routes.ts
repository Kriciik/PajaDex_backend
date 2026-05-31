import { Router } from "express";
import { getCard } from "../controllers/pokemon.controller";

const router = Router();

router.get("/:id", getCard);

export default router;
