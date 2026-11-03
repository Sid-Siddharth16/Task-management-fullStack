import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Loads backend/.env; resolves the same from src/config and dist/config
dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env"),
  quiet: true,
});

const envSchema = z.object({
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
