import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "./useAuth";
import { getRoomMessagesRequest } from "../api/rooms.api";
import { uploadFileRequest } from "../api/files.api";
import { getApiErrorMessage } from "../utils/apiError";
import type { IMessage, IRoom, MessageReadPayload } from "../types";

interface IncomingMessage extends IMessage {
  clientId?: string;
}

/**
 * Owns a room's message history and the realtime message lifecycle:
 * loading state, receiving (deduped + optimistic reconciliation), read
 * receipts, sending text optimistically, and uploading files.
 */
export function useRoomMessages(room: IRoom | null) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const roomId = room?._id ?? null;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load history + join the room.
  useEffect(() => {
    if (!roomId || !socket) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setMessages([]);
    socket.emit("join-room", { roomId });

    getRoomMessagesRequest({ roomId })
      .then((res) => !cancelled && setMessages(res.messages))
      .catch((err) => !cancelled && setError(getApiErrorMessage(err, "Couldn't load messages")))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
      socket.emit("leave-room", { roomId });
    };
  }, [roomId, socket]);

  // Realtime listeners for this room.
  useEffect(() => {
    if (!socket || !roomId) return;

    const onReceive = (msg: IncomingMessage) => {
      if (msg.roomId !== roomId) return;

      setMessages((prev) => {
        // Reconcile our own optimistic message with the server's echo.
        if (msg.clientId) {
          const idx = prev.findIndex((m) => m.clientId === msg.clientId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = msg;
            return next;
          }
        }
        // Otherwise dedupe by id (guards against reconnect/echo duplicates).
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Acknowledge messages from others as read.
      if (msg.senderId._id !== user?._id) {
        socket.emit("mark-read", { roomId, messageId: msg._id });
      }
    };

    const onRead = ({ messageId, userId }: MessageReadPayload) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && !m.readBy.includes(userId)
            ? { ...m, readBy: [...m.readBy, userId] }
            : m
        )
      );
    };

    const onError = ({ message }: { message: string }) => setSendError(message);

    socket.on("receive-message", onReceive);
    socket.on("message-read", onRead);
    socket.on("error", onError);
    return () => {
      socket.off("receive-message", onReceive);
      socket.off("message-read", onRead);
      socket.off("error", onError);
    };
  }, [socket, roomId, user?._id]);

  const sendText = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!socket || !roomId || !user || !trimmed) return;

      const clientId = crypto.randomUUID();
      const optimistic: IMessage = {
        _id: clientId,
        clientId,
        pending: true,
        roomId,
        senderId: user,
        content: trimmed,
        type: "text",
        readBy: [user._id],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      socket.emit("send-message", { roomId, content: trimmed, type: "text", clientId });
    },
    [socket, roomId, user]
  );

  const sendFile = useCallback(
    async (file: File, content = "") => {
      if (!socket || !roomId) return;
      setIsUploading(true);
      setSendError(null);
      try {
        const uploaded = await uploadFileRequest(file);
        socket.emit("send-message", {
          roomId,
          content: content.trim(),
          type: uploaded.messageType,
          fileUrl: uploaded.fileUrl,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          mimeType: uploaded.mimeType,
          clientId: crypto.randomUUID(),
        });
      } catch (err) {
        setSendError(getApiErrorMessage(err, "Couldn't upload that file"));
      } finally {
        setIsUploading(false);
      }
    },
    [socket, roomId]
  );

  const clearSendError = useCallback(() => setSendError(null), []);

  return { messages, isLoading, error, sendError, isUploading, sendText, sendFile, clearSendError };
}
