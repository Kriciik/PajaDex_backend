import { Router } from "express";
import { loginUser, logoutUser, meAuth } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { validateData } from "../middlewares/validate.middleware";
import { loginSchema } from "../schemas/auth.schema";
const router = Router();

router.post("/login", validateData(loginSchema), loginUser);
router.get("/me", verifyToken, meAuth);
router.post("/logout", verifyToken, logoutUser);
export default router;
