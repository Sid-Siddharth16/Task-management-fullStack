import { Router } from "express";
import rootRoutes from "./root.routes.js";
import healthRoutes from "./health.routes.js";

// mounted at API_PREFIX (/api/v1)
const router = Router();

router.use("/", rootRoutes);
router.use("/health", healthRoutes);

export default router;
