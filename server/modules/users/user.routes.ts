import { Router } from "express";
import { getAllUsersController, getUserByIdController } from "./user.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/getUsers", requireAuth, asyncHandler(getAllUsersController));
router.get("/getUser", requireAuth, asyncHandler(getUserByIdController));

export default router;
