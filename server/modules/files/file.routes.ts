import { Router } from "express";
import { uploadFileController } from "./file.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/uploadFile",
  requireAuth,
  upload.single("file"),
  asyncHandler(uploadFileController)
);

export default router;
