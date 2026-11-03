import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // "" prefix loads non-VITE_ vars too; API_PROXY_TARGET is dev-only and never shipped to the browser
  const env = loadEnv(mode, process.cwd(), "");

  // same-origin /api in dev/preview: no CORS preflights, cookies just work
  const proxy = {
    "/api": {
      target: env.API_PROXY_TARGET || "http://localhost:8000",
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, strictPort: true, proxy },
    build: {
      // maps are emitted for error tracking uploads but not referenced from the shipped JS
      sourcemap: "hidden",
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: { modules: { classNameStrategy: "non-scoped" } },
    },
  };
});
