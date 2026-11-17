import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Loads backend/.env; resolves the same from src/config and dist/config
dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env"),
  quiet: true,
});

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    // comma-separated list; must be explicit origins (not "*") since CORS is sent with credentials: true
    CORS_ORIGIN: z
      .string()
      .default("http://localhost:5173")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean)
      ),
    RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

    // auth
    JWT_ACCESS_SECRET: z
      .string()
      .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
    ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
    // public frontend origin, used to build links in emails (e.g. password reset)
    APP_URL: z.url().default("http://localhost:5173"),

    // mail (required in production, optional in dev where links are logged instead)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().default("TaskFlow <no-reply@localhost>"),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === "production" && !value.SMTP_HOST) {
      ctx.addIssue({
        code: "custom",
        path: ["SMTP_HOST"],
        message: "SMTP_HOST is required in production",
      });
    }
    if (
      value.NODE_ENV === "production" &&
      !value.APP_URL.startsWith("https://")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["APP_URL"],
        message: "APP_URL must use https in production",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors
  );
  process.exit(1);
}

export const env = parsed.data;
