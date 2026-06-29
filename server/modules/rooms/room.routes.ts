import { Router } from "express";
import {
  createDMController,
  createGroupController,
  getMyRoomsController,
  getRoomMessagesController,
} from "./room.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/createDirectMessage", requireAuth, asyncHandler(createDMController));
router.post("/createGroup", requireAuth, asyncHandler(createGroupController));
router.get("/getRooms", requireAuth, asyncHandler(getMyRoomsController));
router.get("/getRoomMessages", requireAuth, asyncHandler(getRoomMessagesController));

export default router;
