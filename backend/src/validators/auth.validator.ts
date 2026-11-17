import { z } from "zod";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../constants.js";

const email = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

// policy for new passwords only; login just checks presence so old passwords still work
export const newPassword = z
  .string({ error: "Password is required" })
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters`
  )
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

const name = z
  .string({ error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be at most 50 characters");

// strictObject rejects unknown keys, so fields like `role` can't be mass-assigned
export const signupSchema = z.strictObject({
  name,
  email,
  password: newPassword,
});

export const loginSchema = z.strictObject({
  email,
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required")
    .max(PASSWORD_MAX_LENGTH, "Invalid email or password"),
});

export const forgotPasswordSchema = z.strictObject({ email });

export const resetPasswordSchema = z.strictObject({
  token: z.string({ error: "Reset token is required" }).min(1).max(256),
  password: newPassword,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
