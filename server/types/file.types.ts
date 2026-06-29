import { MessageType } from "../models/Message.model";

export interface IUploadedFile {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  messageType: MessageType;
}
