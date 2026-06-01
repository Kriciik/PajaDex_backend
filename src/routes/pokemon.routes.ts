import { Router } from "express";
import { getCard } from "../controllers/pokemon.controller";
import { verifyToken } from "../controllers/auth.controller";

const router = Router();

router.get("/:id", verifyToken, getCard);

export default router;
