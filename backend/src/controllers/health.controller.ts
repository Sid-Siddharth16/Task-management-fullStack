import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

export interface HealthStatus {
  uptime: number;
  db: "connected" | "disconnected";
}

// 503 when the DB is down so load balancers / uptime checks can route around this instance
export function getHealth(_req: Request, res: Response) {
  const dbConnected = mongoose.connection.readyState === 1;
  const statusCode = dbConnected ? 200 : 503;
  const data: HealthStatus = {
    uptime: process.uptime(),
    db: dbConnected ? "connected" : "disconnected",
  };

  res
    .status(statusCode)
    .json(
      new ApiResponse(
        statusCode,
        data,
        dbConnected ? "API is healthy" : "Database unavailable"
      )
    );
}
