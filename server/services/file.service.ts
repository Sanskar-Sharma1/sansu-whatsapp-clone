import { cloudinary } from "../config/cloudinary";
import { CloudinaryAsset } from "../types/file.types";
import { ALLOWED_UPLOADS } from "../config/uploads";
import { Upload, IUpload } from "../models/Upload.model";
import { ApiError } from "../utils/ApiError";
import { assertObjectId } from "../utils/objectId";

function uploadToCloudinary(
  file: Express.Multer.File,
  resourceType: CloudinaryAsset["resourceType"]
): Promise<CloudinaryAsset> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
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
          publicId: result.public_id,
          fileUrl: result.secure_url,
          resourceType,
        });
      }
    );
    stream.end(file.buffer);
  });
}

/**
 * Stores the file and records it against its uploader. The returned id is the
 * only thing a client ever needs to attach it to a message.
 */
export async function createUpload(
  file: Express.Multer.File,
  ownerId: string
): Promise<IUpload> {
  const kind = ALLOWED_UPLOADS[file.mimetype];
  if (!kind) {
    throw new ApiError(400, "Unsupported file type. Only images, videos, and PDFs are allowed.");
  }

  const asset = await uploadToCloudinary(file, kind.resourceType);

  return Upload.create({
    ownerId,
    ...asset,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    messageType: kind.messageType,
  });
}

/**
 * Atomically takes ownership of an upload for one message. The filter carries
 * the authorization (`ownerId`) and the single-use guarantee (`consumedAt`), so
 * concurrent sends can't attach the same file twice and one user can't attach
 * another's file. A foreign, spent, or unknown id all fail identically.
 */
export async function claimUpload(uploadId: string, ownerId: string): Promise<IUpload> {
  assertObjectId(uploadId, "uploadId");

  const upload = await Upload.findOneAndUpdate(
    { _id: uploadId, ownerId, consumedAt: null },
    { $set: { consumedAt: new Date() } },
    { new: true }
  );
  if (!upload) {
    throw new ApiError(400, "That attachment is no longer available");
  }
  return upload;
}
