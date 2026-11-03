// Relative by default so the dev proxy (and a same-origin reverse proxy in prod) handles routing.
// Set VITE_API_URL to an absolute URL when the API lives on another origin.
const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/+$/, "");

export const ENV = {
  API_BASE_URL,
  API_TIMEOUT_MS: 15_000,
  IS_DEV: import.meta.env.DEV,
} as const;
