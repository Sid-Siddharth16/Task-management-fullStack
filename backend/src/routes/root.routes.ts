import { Router } from "express";
import { getApiInfo } from "../controllers/root.controller.js";

const router = Router();

router.get("/", getApiInfo);

export default router;
