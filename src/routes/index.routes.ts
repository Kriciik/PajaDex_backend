import { Router } from "express";
import pokemonRoute from "./pokemon.routes";
import authRoute from "./auth.routes";
import groupRoute from "./group.routes";
const router = Router();

router.use("/pokemon", pokemonRoute);
router.use("/auth", authRoute);
router.use("/group", groupRoute);
export default router;
