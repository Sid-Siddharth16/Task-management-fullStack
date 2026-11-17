import type { Request, Response } from "express";
import { COOKIES } from "../constants.js";
import { UserModel } from "../models/user.model.js";
import * as authService from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies.js";

const requestMeta = (req: Request): authService.RequestMeta => ({
  userAgent: req.get("user-agent"),
  ip: req.ip,
});

const readRefreshToken = (req: Request): string | undefined => {
  const token: unknown = req.cookies?.[COOKIES.REFRESH_TOKEN];
  return typeof token === "string" && token ? token : undefined;
};

export async function signup(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.signup(
    req.body,
    requestMeta(req)
  );
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json(new ApiResponse(201, { user }, "Account created"));
}

export async function login(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body,
    requestMeta(req)
  );
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json(new ApiResponse(200, { user }, "Signed in"));
}

export async function refresh(req: Request, res: Response) {
  try {
    const { user, accessToken, refreshToken } =
      await authService.rotateRefreshToken(
        readRefreshToken(req),
        requestMeta(req)
      );
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json(new ApiResponse(200, { user }, "Session refreshed"));
  } catch (err) {
    // a dead refresh token is useless to the browser; drop both cookies
    clearAuthCookies(res);
    throw err;
  }
}

export async function logout(req: Request, res: Response) {
  await authService.logout(readRefreshToken(req));
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, "Signed out"));
}

export async function me(req: Request, res: Response) {
  const user = await UserModel.findById(req.user!.id);
  if (!user) throw new ApiError(401, "Authentication required");
  res.status(200).json(new ApiResponse(200, { user }, "Current user"));
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.requestPasswordReset(req.body.email);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If an account exists for that email, we've sent a link to reset your password."
      )
    );
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.password);
  clearAuthCookies(res);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Your password has been reset. Please sign in."
      )
    );
}
