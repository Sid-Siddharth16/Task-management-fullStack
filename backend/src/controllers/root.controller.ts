import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { API_NAME, API_VERSION } from "../constants.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export interface ApiInfo {
  name: string;
  version: string;
  environment: string;
  timestamp: string;
}

export function getApiInfo(_req: Request, res: Response) {
  const info: ApiInfo = {
    name: API_NAME,
    version: API_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(new ApiResponse(200, info, "Welcome to the API"));
}
