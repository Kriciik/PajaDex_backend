import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import {
  createGroup,
  getGroupCardIds,
  getGroups,
  updateGroupCards,
} from "../controllers/group.controller";

const router = Router();
router.get("/", verifyToken, getGroups);
router.post("/", verifyToken, createGroup);
router.put("/cards", verifyToken, updateGroupCards);
router.get("/:groupId/card-ids", verifyToken, getGroupCardIds);

export default router;
