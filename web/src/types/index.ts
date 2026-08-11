export type MessageType = "text" | "image" | "video" | "pdf";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "local" | "google";
  isOnline: boolean;
  lastSeen: string;
}

export interface IRoom {
  _id: string;
  name?: string;
  type: "dm" | "group";
  members: IUser[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  roomId: string;
  senderId: IUser;
  content: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  deliveredTo: string[];
  readBy: string[];
  createdAt: string;
  /** Client-only: correlates an optimistic message with its server echo. */
  clientId?: string;
  /** Client-only: true while an optimistic message awaits server confirmation. */
  pending?: boolean;
}

/**
 * The upload endpoint hands back a handle, nothing else. File metadata lives
 * server-side so it can't be tampered with on the way to `send-message`.
 */
export interface IUploadResponse {
  uploadId: string;
}

// Socket event payloads
export interface SendMessagePayload {
  roomId: string;
  content?: string;
  uploadId?: string;
  clientId?: string;
}

export interface TypingPayload {
  userId: string;
  name: string;
  roomId: string;
}

/** Batched receipt broadcast — used by both `messages-delivered` and `messages-read`. */
export interface MessageReceiptPayload {
  roomId: string;
  messageIds: string[];
  userId: string;
}

export interface PresencePayload {
  userId: string;
  lastSeen?: string;
}
