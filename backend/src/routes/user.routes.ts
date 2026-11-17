import { Router } from "express";
import { ROLES } from "../constants.js";
import {
  listUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  updateRoleSchema,
  updateStatusSchema,
} from "../validators/user.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize(ROLES.ADMIN, ROLES.MANAGER), listUsers);
router.patch(
  "/:id/role",
  authorize(ROLES.ADMIN),
  validate(updateRoleSchema),
  updateUserRole
);
router.patch(
  "/:id/status",
  authorize(ROLES.ADMIN),
  validate(updateStatusSchema),
  updateUserStatus
);

export default router;
