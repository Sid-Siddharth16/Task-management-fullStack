import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { API_PREFIX } from "./constants.js";
import routes from "./routes/index.js";
import { apiLimiter } from "./middlewares/rateLimit.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// trust the first proxy so req.ip is the real client ip (needed for rate limiting behind a proxy)
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use("/api", apiLimiter);
app.use(API_PREFIX, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
