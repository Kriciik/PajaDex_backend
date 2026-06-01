import { Router } from "express";
import pokemonRoute from "./pokemon.routes";
import authRoute from "./auth.routes";
const router = Router();

router.use("/pokemon", pokemonRoute);
router.use("/auth", authRoute);

export default router;
