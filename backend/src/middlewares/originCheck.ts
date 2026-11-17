import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// CSRF defence in depth (cookies are already SameSite=Strict): browsers attach Origin
// and Sec-Fetch-Site to state-changing requests, so reject any that come from elsewhere.
// Non-browser clients (curl, server-to-server) send neither and are unaffected.
export function originCheck(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  if (origin && !env.CORS_ORIGIN.includes(origin)) {
    return next(new ApiError(403, "Request origin not allowed"));
  }
  if (!origin && req.get("sec-fetch-site") === "cross-site") {
    return next(new ApiError(403, "Request origin not allowed"));
  }
  next();
}
