import mongoose, { Schema, Document, Types } from "mongoose";
import { AttachmentType } from "./Message.model";
import { ResourceType } from "../config/uploads";

/**
 * A file the server itself put in Cloudinary, recorded at upload time.
 *
 * Clients only ever hand back an `_id`; every byte of metadata on a message
 * is read from here, so a forged socket payload can't invent an attachment.
 * Single-use: `consumedAt` is stamped atomically when a message claims it.
 */
export interface IUpload extends Document {
  ownerId: Types.ObjectId;
  publicId: string;
  resourceType: ResourceType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  messageType: AttachmentType;
  consumedAt: Date | null;
  createdAt: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Cloudinary's handle for the asset — needed to delete it later.
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video", "raw"], required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    messageType: { type: String, enum: ["image", "video", "pdf"], required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Supports sweeping abandoned uploads (never consumed, older than a cutoff).
UploadSchema.index({ consumedAt: 1, createdAt: 1 });

export const Upload = mongoose.model<IUpload>("Upload", UploadSchema);
