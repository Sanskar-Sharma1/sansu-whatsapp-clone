import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "./useAuth";
import { getRoomMessagesRequest } from "../api/rooms.api";
import { uploadFileRequest } from "../api/files.api";
import { getApiErrorMessage } from "../utils/apiError";
import type { IMessage, IRoom, MessageReceiptPayload } from "../types";

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
      .then((res) => {
        if (cancelled) return;
        setMessages(res.messages);
        // Opening the room reads its backlog, not just what arrives from here on.
        socket.emit("mark-room-read", { roomId });
      })
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

      // The room is open, so a message from someone else is read on arrival.
      if (msg.senderId._id !== user?._id) {
        socket.emit("mark-room-read", { roomId });
      }
    };

    /** Adds `userId` to one receipt list across every message in `messageIds`. */
    const applyReceipt = (
      field: "deliveredTo" | "readBy",
      { roomId: eventRoomId, messageIds, userId }: MessageReceiptPayload
    ) => {
      if (eventRoomId !== roomId) return;
      const ids = new Set(messageIds);
      setMessages((prev) =>
        prev.map((m) =>
          ids.has(m._id) && !m[field].includes(userId)
            ? { ...m, [field]: [...m[field], userId] }
            : m
        )
      );
    };

    const onDelivered = (payload: MessageReceiptPayload) => applyReceipt("deliveredTo", payload);
    const onRead = (payload: MessageReceiptPayload) => applyReceipt("readBy", payload);
    const onError = ({ message }: { message: string }) => setSendError(message);

    socket.on("receive-message", onReceive);
    socket.on("messages-delivered", onDelivered);
    socket.on("messages-read", onRead);
    socket.on("error", onError);
    return () => {
      socket.off("receive-message", onReceive);
      socket.off("messages-delivered", onDelivered);
      socket.off("messages-read", onRead);
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
        deliveredTo: [],
        readBy: [user._id],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      socket.emit("send-message", { roomId, content: trimmed, clientId });
    },
    [socket, roomId, user]
  );

  const sendFile = useCallback(
    async (file: File, content = "") => {
      if (!socket || !roomId) return;
      setIsUploading(true);
      setSendError(null);
      try {
        // Only the handle travels back — the server owns the file's metadata.
        const { uploadId } = await uploadFileRequest(file);
        socket.emit("send-message", {
          roomId,
          content: content.trim(),
          uploadId,
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
