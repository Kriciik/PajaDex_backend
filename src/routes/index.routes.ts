import { Router } from "express";
import pokemonRoute from "./pokemon.routes";

const router = Router();

router.use("/pokemon", pokemonRoute);

export default router;
