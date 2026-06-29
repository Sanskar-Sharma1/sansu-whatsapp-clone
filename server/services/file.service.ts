import { cloudinary } from "../config/cloudinary";
import { IUploadedFile } from "../types/file.types";
import { ALLOWED_UPLOADS } from "../config/uploads";
import { ApiError } from "../utils/ApiError";

export function uploadToCloudinary(
  file: Express.Multer.File
): Promise<IUploadedFile> {
  const kind = ALLOWED_UPLOADS[file.mimetype];
  if (!kind) {
    throw new ApiError(400, "Unsupported file type. Only images, videos, and PDFs are allowed.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: kind.resourceType,
        folder: "whatsapp_clone",
        // Unguessable public id; never overwrite an existing asset.
        unique_filename: true,
        use_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new ApiError(502, "File upload failed"));
        }
        resolve({
          fileUrl: result.secure_url,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          messageType: kind.messageType,
        });
      }
    );
    stream.end(file.buffer);
  });
}
