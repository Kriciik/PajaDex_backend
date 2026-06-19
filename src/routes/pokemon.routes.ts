import { Router } from "express";
import { getCard, getCardList, postCardToCollection } from "../controllers/pokemon.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", verifyToken, getCardList);
router.get("/:id", verifyToken, getCard);
router.post("/collection", verifyToken, postCardToCollection);

export default router;
