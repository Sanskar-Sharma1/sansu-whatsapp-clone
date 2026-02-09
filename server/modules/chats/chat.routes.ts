import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getChatsController,
  createPrivateChatController,
} from "./chat.controller";

const router = Router();

/** All routes protected */
router.use(authMiddleware);

router.get("/", getChatsController);
router.post("/private", createPrivateChatController);

export default router;
