import { Router } from "express";
import rootRoutes from "./root.routes.js";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

// mounted at API_PREFIX (/api/v1)
const router = Router();

router.use("/", rootRoutes);
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
