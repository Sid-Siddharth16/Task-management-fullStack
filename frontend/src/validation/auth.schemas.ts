import { z } from "zod";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../constants/auth.constant";

// Same rules as the backend so users get instant feedback; the backend remains the authority.
const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

const newPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

const passwordsMatch = {
  check: (v: { password: string; confirmPassword: string }) => v.password === v.confirmPassword,
  params: { path: ["confirmPassword"], message: "Passwords don't match" },
};

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    email,
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch.check, passwordsMatch.params);

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password: newPassword, confirmPassword: z.string() })
  .refine(passwordsMatch.check, passwordsMatch.params);

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
