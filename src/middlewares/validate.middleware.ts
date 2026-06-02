import { NextFunction, Request, Response } from "express";
import { ZodAny, ZodObject } from "zod";
import { ZodSchema } from "zod/v3";

export function validateData(schema: ZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
