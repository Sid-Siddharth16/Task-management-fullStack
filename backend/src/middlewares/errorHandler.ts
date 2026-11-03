import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError, type FieldError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: FieldError[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = errors[0]?.message ?? "Validation failed";
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    err.code === 11000
  ) {
    // duplicate key on a unique index
    statusCode = 409;
    const fields = Object.keys((err as { keyValue?: object }).keyValue ?? {});
    message = `${fields.join(", ") || "Resource"} already exists`;
  }

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.NODE_ENV === "development" &&
      err instanceof Error && { stack: err.stack }),
  });
}
