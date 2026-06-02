import { NextFunction, Response } from "express";
import { AuthenticatedRequest, JwtPayLoad } from "../controllers/auth.controller";
import jwt from "jsonwebtoken";

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayLoad;

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(501).json({ error: "Unauthorized" });
  }
}
