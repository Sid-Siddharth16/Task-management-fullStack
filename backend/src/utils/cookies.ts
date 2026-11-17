import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";
import { AUTH_ROUTES_PATH, COOKIES } from "../constants.js";

const baseOptions: CookieOptions = {
  httpOnly: true, // not readable from JS, so XSS can't steal tokens
  secure: env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // never sent on cross-site requests (CSRF defence)
};

const accessOptions: CookieOptions = { ...baseOptions, path: "/api" };
const refreshOptions: CookieOptions = {
  ...baseOptions,
  path: AUTH_ROUTES_PATH,
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie(COOKIES.ACCESS_TOKEN, accessToken, {
    ...accessOptions,
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * 60_000,
  });
  res.cookie(COOKIES.REFRESH_TOKEN, refreshToken, {
    ...refreshOptions,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60_000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(COOKIES.ACCESS_TOKEN, accessOptions);
  res.clearCookie(COOKIES.REFRESH_TOKEN, refreshOptions);
}
