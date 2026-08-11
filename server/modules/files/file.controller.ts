import { Request, Response } from "express";
import { createUpload } from "../../services/file.service";
import { IUploadResponse } from "../../types/file.types";
import { ApiError } from "../../utils/ApiError";

export async function uploadFileController(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "No file provided");
  if (!req.user) throw new ApiError(401, "Authentication required");

  const upload = await createUpload(req.file, req.user._id);

  // Handle only — the metadata stays server-side.
  const body: IUploadResponse = { uploadId: upload._id.toString() };
  res.status(201).json(body);
}
