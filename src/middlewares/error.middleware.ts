import { NextFunction, Request, Response } from "express";
import "dotenv/config";
import { ZodError } from "zod";
import { stat } from "node:fs";
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error!");
  console.error(err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  if (err instanceof ZodError) {
    const validationErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      status: "error",
      statusCode: 400,
      message: "Validation error",
      errors: validationErrors,
    });
  }
  return res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "production" && { stack: err.stack }),
  });
}
