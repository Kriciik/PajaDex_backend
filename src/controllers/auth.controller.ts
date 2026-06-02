import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export type JwtPayLoad = {
  id: string;
};

export async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({ message: "Login successful" });
  } catch (error) {
    next(error);
  }
}

export function logoutUser(req: Request, res: Response) {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
  res.redirect("/login");
}

export function meAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ userId: req.userId });
}
