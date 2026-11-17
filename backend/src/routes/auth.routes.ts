import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import {
  loginLimiter,
  passwordResetLimiter,
  signupLimiter,
} from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "../validators/auth.validator.js";

const router = Router();

// auth responses carry user data and set cookies; never let a proxy or browser cache them
router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.post("/signup", signupLimiter, validate(signupSchema), auth.signup);
router.post("/login", loginLimiter, validate(loginSchema), auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.get("/me", authenticate, auth.me);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  auth.forgotPassword
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  validate(resetPasswordSchema),
  auth.resetPassword
);

export default router;
