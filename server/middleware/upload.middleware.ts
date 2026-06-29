import multer from "multer";
import { Request } from "express";
import { isAllowedMime, MAX_FILE_SIZE } from "../config/uploads";
import { ApiError } from "../utils/ApiError";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (isAllowedMime(file.mimetype)) {
      cb(null, true);
    } else {
      // ApiError → handled as 400 by the global error handler (not a 500).
      cb(new ApiError(400, "Unsupported file type. Only images, videos, and PDFs are allowed."));
    }
  },
});
