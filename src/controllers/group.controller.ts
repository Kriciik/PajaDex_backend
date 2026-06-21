import { NextFunction, Request, Response } from "express";
import {
  createNewGroup,
  getCardIdsByGroupId,
  getGroupByNameAndUser,
  getGroupsByUserId,
  syncGroupCards,
} from "../services/group.services";

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const userId = (req as any).userId;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Group name is required" });
    }
    // Generate a random color for the group
    const color = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

    const existingGroup = await getGroupByNameAndUser(name, userId);
    if (existingGroup) {
      return res.status(409).json({ message: "Group with this name already exists" });
    }
    const newGroup = await createNewGroup(name, userId, color);
    return res.status(201).json(newGroup);
  } catch (error) {
    next(error);
  }
}

export async function getGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;

    const userGroups = await getGroupsByUserId(userId);
    return res.status(200).json(userGroups);
  } catch (error) {
    next(error);
  }
}

export async function updateGroupCards(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId, cardIds } = req.body;

    if (!groupId || !Array.isArray(cardIds)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    await syncGroupCards(groupId, cardIds);
    return res.status(200).json({ message: "Group cards updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getGroupCardIds(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId } = req.params;

    const rows = await getCardIdsByGroupId(groupId as string);
    const cardIds = rows.map((row) => row.cardId);
    return res.status(200).json(cardIds);
  } catch (error) {
    next(error);
  }
}
