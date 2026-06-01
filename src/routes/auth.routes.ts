import { Router } from "express";
import { loginUser, verifyToken } from "../controllers/auth.controller";
const router = Router();

router.post("/login", loginUser);
export default router;
