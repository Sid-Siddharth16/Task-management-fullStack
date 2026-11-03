import mongoose from "mongoose";
import { env } from "../config/env.js";
import { DB_NAME } from "../constants.js";

export async function connectDB(): Promise<void> {
  mongoose.connection.on("error", (err) =>
    console.error("MongoDB error:", err)
  );
  mongoose.connection.on("disconnected", () =>
    console.warn("MongoDB disconnected")
  );

  const { connection } = await mongoose.connect(env.DATABASE_URL, {
    dbName: DB_NAME,
  });
  console.log(`MongoDB connected: ${connection.host}/${connection.name}`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
