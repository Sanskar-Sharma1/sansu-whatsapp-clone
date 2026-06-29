import { MessageType } from "../models/Message.model";

export interface SendMessagePayload {
  roomId: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface TypingPayload {
  roomId: string;
}

export interface MarkReadPayload {
  roomId: string;
  messageId: string;
}
