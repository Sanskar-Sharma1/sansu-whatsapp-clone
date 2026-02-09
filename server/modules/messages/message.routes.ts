import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getMessagesController,
  sendMessageController,
} from "./message.controller";

const router = Router();

/** All message routes protected */
router.use(authMiddleware);

router.get("/:chatId", getMessagesController);
router.post("/", sendMessageController);

export default router;
