import { Router } from "express";
import { getCard, getCardList } from "../controllers/pokemon.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", verifyToken, getCardList);
router.get("/:id", verifyToken, getCard);

export default router;
