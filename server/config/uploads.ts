import { AttachmentType } from "../models/Message.model";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export type ResourceType = "image" | "video" | "raw";

interface UploadKind {
  messageType: AttachmentType;
  resourceType: ResourceType;
}

/**
 * Single source of truth for accepted uploads. Used by both the multer filter
 * (to reject early) and the Cloudinary service (to pick the resource type).
 */
export const ALLOWED_UPLOADS: Readonly<Record<string, UploadKind>> = {
  "image/jpeg": { messageType: "image", resourceType: "image" },
  "image/png": { messageType: "image", resourceType: "image" },
  "image/gif": { messageType: "image", resourceType: "image" },
  "image/webp": { messageType: "image", resourceType: "image" },
  "video/mp4": { messageType: "video", resourceType: "video" },
  "video/quicktime": { messageType: "video", resourceType: "video" },
  "video/webm": { messageType: "video", resourceType: "video" },
  "application/pdf": { messageType: "pdf", resourceType: "raw" },
};

export function isAllowedMime(mime: string): boolean {
  return Object.prototype.hasOwnProperty.call(ALLOWED_UPLOADS, mime);
}
