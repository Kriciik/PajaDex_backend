import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

type JwtPayLoad = {
  id: string;
};

export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));

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

    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export function logoutUser(req: Request, res: Response) {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
  res.redirect("/login");
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayLoad;

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
