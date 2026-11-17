import type { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { COOKIES, type Role } from "../constants.js";
import { UserModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/tokens.js";

// Verifies the access-token cookie and attaches the current user to req.user.
// The user is re-read from the DB on every request so deactivation and role changes
// apply immediately instead of when the token expires.
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token: unknown = req.cookies?.[COOKIES.ACCESS_TOKEN];
  if (typeof token !== "string" || !token) {
    throw new ApiError(401, "Authentication required");
  }

  let payload: AccessTokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!isValidObjectId(payload.sub))
    throw new ApiError(401, "Authentication required");

  const user = await UserModel.findById(payload.sub)
    .select("name email role isActive passwordChangedAt")
    .lean();

  if (!user || !user.isActive)
    throw new ApiError(401, "Authentication required");

  // token issued before the last password change is no longer valid
  if (
    user.passwordChangedAt &&
    payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  req.user = {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
  next();
}

// Must run after authenticate. Usage: router.get("/", authenticate, authorize("admin"), handler)
export const authorize =
  (...allowed: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    if (!allowed.includes(req.user.role)) {
      return next(
        new ApiError(403, "You don't have permission to perform this action")
      );
    }
    next();
  };
