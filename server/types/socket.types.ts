/**
 * Everything the client may say about a message. Type and file metadata are
 * absent by design — the server derives them from the claimed upload.
 */
export interface SendMessagePayload {
  roomId: string;
  content?: string;
  uploadId?: string;
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
