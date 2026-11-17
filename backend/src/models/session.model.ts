import { Schema, model, Types, type InferSchemaType } from "mongoose";

// One document per issued refresh token. Tokens are stored as sha256 hashes only.
// A "family" is the chain of rotated tokens that started from one login.
const sessionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    family: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedBy: { type: Types.ObjectId, ref: "Session", default: null },
    userAgent: { type: String, maxlength: 512 },
    ip: { type: String, maxlength: 64 },
  },
  { timestamps: true }
);

// MongoDB removes expired sessions automatically
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type Session = InferSchemaType<typeof sessionSchema>;

export const SessionModel = model("Session", sessionSchema);
