import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// applied to all /api routes; health checks are skipped so load balancers never get throttled
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => req.path.endsWith("/health"),
  handler: (_req, _res, next) =>
    next(new ApiError(429, "Too many requests, please try again later")),
});
