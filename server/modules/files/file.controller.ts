import { Request, Response } from "express";
import { uploadToCloudinary } from "../../services/file.service";
import { ApiError } from "../../utils/ApiError";

export async function uploadFileController(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "No file provided");
  const result = await uploadToCloudinary(req.file);
  res.json(result);
}
