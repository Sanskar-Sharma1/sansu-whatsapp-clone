import { Router } from "express";
import { getMeController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

/** Protected route */
router.get("/me", authMiddleware, getMeController);

export default router;
