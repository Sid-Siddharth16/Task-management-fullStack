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

const authLimiterOptions = {
  windowMs: 15 * 60_000,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(
      new ApiError(429, "Too many attempts. Please try again in a few minutes.")
    ),
} satisfies Parameters<typeof rateLimit>[0];

// brute-force protection for credential endpoints; each limiter keeps its own counter
// login: only failed attempts count, so a user signing in normally is never throttled
export const loginLimiter = rateLimit({
  ...authLimiterOptions,
  skipSuccessfulRequests: true,
});
export const signupLimiter = rateLimit(authLimiterOptions);
export const passwordResetLimiter = rateLimit(authLimiterOptions);
