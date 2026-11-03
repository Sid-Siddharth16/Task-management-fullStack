import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./db/connect.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(
      `Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`
    );
  });

  let shuttingDown = false;
  const shutdown = (signal: string, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down...`);

    // force exit if open connections keep the server from closing
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();

    server.close(async () => {
      await disconnectDB();
      process.exit(exitCode);
    });
    server.closeIdleConnections();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    shutdown("unhandledRejection", 1);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    shutdown("uncaughtException", 1);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
