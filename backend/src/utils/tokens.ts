import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { JWT_AUDIENCE, JWT_ISSUER, type Role } from "../constants.js";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  iat: number;
  exp: number;
}

export function signAccessToken(userId: string, role: Role): string {
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    subject: userId,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: env.ACCESS_TOKEN_TTL_MINUTES * 60,
  });
}

// Throws on bad signature, expiry, wrong issuer/audience or algorithm.
// The algorithm is pinned so "alg: none" or algorithm-swap tokens are rejected.
export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  if (typeof payload === "string" || !payload.sub || !payload.iat) {
    throw new Error("Malformed token payload");
  }
  return payload as AccessTokenPayload;
}

// 256 bits of randomness, URL-safe; used for refresh and password-reset tokens
export const generateOpaqueToken = () =>
  crypto.randomBytes(32).toString("base64url");

// Only hashes are stored, so a DB leak doesn't hand out usable tokens.
// sha256 (not argon2) is fine here because the input is high-entropy random data.
export const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");
