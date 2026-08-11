import { MessageType } from "../models/Message.model";

export interface SendMessagePayload {
  roomId: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  clientId?: string;
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface TypingPayload {
  roomId: string;
}

export interface MarkRoomReadPayload {
  roomId: string;
}
