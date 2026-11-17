import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";
import { ROLE_VALUES, ROLES } from "../constants.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // never selected unless explicitly requested with .select("+password")
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.MEMBER,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    // access tokens issued before this moment are rejected
    passwordChangedAt: { type: Date },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.password;
        delete ret.passwordResetTokenHash;
        delete ret.passwordResetExpires;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  }
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

export const UserModel = model("User", userSchema);
