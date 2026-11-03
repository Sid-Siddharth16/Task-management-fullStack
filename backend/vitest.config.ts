import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      CORS_ORIGIN: "http://localhost:5173",
    },
  },
});
