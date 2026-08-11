import { ResourceType } from "../config/uploads";

/** What Cloudinary gives back once the bytes are stored. */
export interface CloudinaryAsset {
  publicId: string;
  fileUrl: string;
  resourceType: ResourceType;
}

/**
 * The upload endpoint's entire response. Deliberately opaque — the client gets
 * a handle, not the metadata, so it has nothing to tamper with.
 */
export interface IUploadResponse {
  uploadId: string;
}
