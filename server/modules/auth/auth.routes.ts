import { Router } from "express";
import {
  registerController,
  loginController,
  googleAuthController,
  getMeController,
  logoutController,
} from "./auth.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { authLimiter } from "../../middleware/rateLimit.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/register", authLimiter, asyncHandler(registerController));
router.post("/login", authLimiter, asyncHandler(loginController));
router.post("/googleLogin", authLimiter, asyncHandler(googleAuthController));
router.get("/getUserDetails", requireAuth, getMeController);
router.post("/logout", logoutController);

export default router;
