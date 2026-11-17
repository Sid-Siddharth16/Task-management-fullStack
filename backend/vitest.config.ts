import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      CORS_ORIGIN: "http://localhost:5173",
      // tests never touch a real DB; auth suites use mongodb-memory-server
      DATABASE_URL: "mongodb://127.0.0.1:1/unused",
      JWT_ACCESS_SECRET: "test-secret-that-is-long-enough-for-hs256-signing",
      APP_URL: "http://localhost:5173",
      SMTP_HOST: "",
    },
    // first run downloads a mongod binary
    hookTimeout: 120_000,
  },
});
