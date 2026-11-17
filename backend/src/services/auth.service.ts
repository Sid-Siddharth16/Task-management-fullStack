import crypto from "node:crypto";
import { Types } from "mongoose";
import { env } from "../config/env.js";
import { PASSWORD_RESET_TTL_MS } from "../constants.js";
import { SessionModel } from "../models/session.model.js";
import { UserModel, type UserDocument } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  burnPasswordCheck,
  hashPassword,
  verifyPassword,
} from "../utils/password.js";
import {
  generateOpaqueToken,
  sha256,
  signAccessToken,
} from "../utils/tokens.js";
import {
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
} from "./mail.service.js";
import type { LoginInput, SignupInput } from "../validators/auth.validator.js";

export interface RequestMeta {
  userAgent?: string;
  ip?: string;
}

export interface AuthResult {
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
}

// Two tabs refreshing at the same moment both present the same token. Within this window
// the second one is treated as a benign race rather than token theft.
const REFRESH_REUSE_GRACE_MS = 10_000;

const INVALID_CREDENTIALS = "Invalid email or password";
const SESSION_EXPIRED = "Your session has expired. Please sign in again.";

async function issueTokens(
  user: UserDocument,
  meta: RequestMeta,
  family: string = crypto.randomUUID(),
  sessionId: Types.ObjectId = new Types.ObjectId()
): Promise<AuthResult> {
  const refreshToken = generateOpaqueToken();
  await SessionModel.create({
    _id: sessionId,
    user: user._id,
    tokenHash: sha256(refreshToken),
    family,
    expiresAt: new Date(
      Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60_000
    ),
    userAgent: meta.userAgent?.slice(0, 512),
    ip: meta.ip?.slice(0, 64),
  });

  return {
    user,
    accessToken: signAccessToken(user.id, user.role),
    refreshToken,
  };
}

export async function signup(
  input: SignupInput,
  meta: RequestMeta
): Promise<AuthResult> {
  if (await UserModel.exists({ email: input.email })) {
    throw new ApiError(409, "An account with this email already exists", [
      { field: "email", message: "An account with this email already exists" },
    ]);
  }

  // role is never taken from input: every self-signup is a member
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    password: await hashPassword(input.password),
  });

  return issueTokens(user, meta);
}

export async function login(
  input: LoginInput,
  meta: RequestMeta
): Promise<AuthResult> {
  const user = await UserModel.findOne({ email: input.email }).select(
    "+password"
  );

  if (!user) {
    await burnPasswordCheck(input.password);
    throw new ApiError(401, INVALID_CREDENTIALS);
  }

  const valid = await verifyPassword(user.password, input.password);
  if (!valid || !user.isActive) throw new ApiError(401, INVALID_CREDENTIALS);

  return issueTokens(user, meta);
}

export const revokeAllSessions = (userId: Types.ObjectId | string) =>
  SessionModel.updateMany(
    { user: userId, revokedAt: null },
    { revokedAt: new Date() }
  );

export async function rotateRefreshToken(
  token: string | undefined,
  meta: RequestMeta
): Promise<AuthResult> {
  if (!token) throw new ApiError(401, SESSION_EXPIRED);
  const tokenHash = sha256(token);
  const now = new Date();

  // atomically claim the token (revoke + link to its successor in one write)
  // so two concurrent requests can't both rotate it
  const nextSessionId = new Types.ObjectId();
  const claimed = await SessionModel.findOneAndUpdate(
    { tokenHash, revokedAt: null, expiresAt: { $gt: now } },
    { revokedAt: now, replacedBy: nextSessionId }
  );

  const session = claimed ?? (await SessionModel.findOne({ tokenHash }));
  if (!session || session.expiresAt <= now)
    throw new ApiError(401, SESSION_EXPIRED);

  if (!claimed) {
    const revokedFor = now.getTime() - (session.revokedAt?.getTime() ?? 0);
    // replacedBy is only set by rotation, so logged-out / family-revoked tokens never get a grace period
    if (!session.replacedBy || revokedFor > REFRESH_REUSE_GRACE_MS) {
      // an already-rotated token was presented again: assume it was stolen and
      // kill every session in this login chain (attacker and victim are both logged out)
      await SessionModel.updateMany(
        { family: session.family, revokedAt: null },
        { revokedAt: now }
      );
      throw new ApiError(401, SESSION_EXPIRED);
    }
  }

  const user = await UserModel.findById(session.user);
  if (!user || !user.isActive) {
    await revokeAllSessions(session.user);
    throw new ApiError(401, SESSION_EXPIRED);
  }

  return issueTokens(
    user,
    meta,
    session.family,
    claimed ? nextSessionId : undefined
  );
}

export async function logout(token: string | undefined): Promise<void> {
  if (!token) return;
  await SessionModel.updateOne(
    { tokenHash: sha256(token), revokedAt: null },
    { revokedAt: new Date() }
  );
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await UserModel.findOne({ email, isActive: true });
  // same response whether or not the account exists (no user enumeration)
  if (!user) return;

  const token = generateOpaqueToken();
  user.passwordResetTokenHash = sha256(token);
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  const resetUrl = `${env.APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  // not awaited: keeps response time the same for known and unknown emails
  sendPasswordResetEmail(user.email, user.name, resetUrl).catch((err) =>
    console.error("Failed to send password reset email:", err)
  );
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const user = await UserModel.findOne({
    passwordResetTokenHash: sha256(token),
    passwordResetExpires: { $gt: new Date() },
    isActive: true,
  });
  if (!user)
    throw new ApiError(400, "This reset link is invalid or has expired");

  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // every existing login is signed out; access tokens are rejected via passwordChangedAt
  await revokeAllSessions(user._id);

  sendPasswordChangedEmail(user.email, user.name).catch((err) =>
    console.error("Failed to send password changed email:", err)
  );
}
