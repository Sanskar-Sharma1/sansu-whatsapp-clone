import { Server as SocketServer, Socket } from "socket.io";
import { Types } from "mongoose";
import { Message } from "../models/Message.model";
import { Room } from "../models/Room.model";
import { User } from "../models/User.model";
import { isRoomMember } from "../modules/rooms/room.service";
import {
  SendMessagePayload,
  TypingPayload,
  MarkReadPayload,
  JoinRoomPayload,
} from "../types/socket.types";

const MESSAGE_TYPES = new Set<string>(["text", "image", "video", "pdf"]);
const MAX_CONTENT_LENGTH = 5000;

/**
 * Live socket count per user. Presence only flips on the first connect (0→1)
 * and the last disconnect (1→0), so a second browser tab can't mark the user
 * offline while they're still connected elsewhere.
 */
const onlineCounts = new Map<string, number>();

function isValidId(id: unknown): id is string {
  return typeof id === "string" && Types.ObjectId.isValid(id);
}

export function registerSocketHandlers(io: SocketServer, socket: Socket) {
  const user = socket.data.user;

  async function handleConnect() {
    const next = (onlineCounts.get(user._id) ?? 0) + 1;
    onlineCounts.set(user._id, next);

    // Join every room the user belongs to so they receive room broadcasts.
    const rooms = await Room.find({ members: user._id }).select("_id").lean();
    for (const room of rooms) socket.join(room._id.toString());

    if (next === 1) {
      await User.findByIdAndUpdate(user._id, { isOnline: true });
      socket.broadcast.emit("user-online", { userId: user._id });
    }
  }

  handleConnect().catch((err) => console.error("socket connect error:", err));

  socket.on("join-room", async ({ roomId }: JoinRoomPayload) => {
    try {
      if (!isValidId(roomId)) {
        socket.emit("error", { message: "Invalid roomId" });
        return;
      }
      // Authorization: only members may join (and thus receive) a room.
      if (!(await isRoomMember(roomId, user._id))) {
        socket.emit("error", { message: "Not a room member" });
        return;
      }
      socket.join(roomId);
    } catch (err) {
      console.error("join-room error:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("leave-room", ({ roomId }: JoinRoomPayload) => {
    if (isValidId(roomId)) socket.leave(roomId);
  });

  socket.on("send-message", async (payload: SendMessagePayload) => {
    try {
      const { roomId, content, type, fileUrl, fileName, fileSize, mimeType } = payload ?? {};

      if (!isValidId(roomId)) {
        socket.emit("error", { message: "Invalid roomId" });
        return;
      }
      if (!MESSAGE_TYPES.has(type)) {
        socket.emit("error", { message: "Invalid message type" });
        return;
      }
      const text = typeof content === "string" ? content : "";
      if (text.length > MAX_CONTENT_LENGTH) {
        socket.emit("error", { message: "Message too long" });
        return;
      }
      if (type === "text" && !text.trim()) {
        socket.emit("error", { message: "Cannot send an empty message" });
        return;
      }
      if (type !== "text" && !fileUrl) {
        socket.emit("error", { message: "File message is missing its file" });
        return;
      }

      if (!(await isRoomMember(roomId, user._id))) {
        socket.emit("error", { message: "Not a room member" });
        return;
      }

      const message = await Message.create({
        roomId,
        senderId: user._id,
        content: text,
        type,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        readBy: [user._id],
      });

      const populated = await message.populate("senderId", "name email avatarUrl");
      io.to(roomId).emit("receive-message", populated.toObject());
    } catch (err) {
      console.error("send-message error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("typing", ({ roomId }: TypingPayload) => {
    if (!isValidId(roomId)) return;
    socket.to(roomId).emit("user-typing", { userId: user._id, name: user.name, roomId });
  });

  socket.on("stop-typing", ({ roomId }: TypingPayload) => {
    if (!isValidId(roomId)) return;
    socket.to(roomId).emit("user-stop-typing", { userId: user._id, roomId });
  });

  socket.on("mark-read", async ({ roomId, messageId }: MarkReadPayload) => {
    try {
      if (!isValidId(roomId) || !isValidId(messageId)) return;
      if (!(await isRoomMember(roomId, user._id))) return;

      // Scope by { _id, roomId } so a user can't touch messages outside the room.
      const updated = await Message.findOneAndUpdate(
        { _id: messageId, roomId },
        { $addToSet: { readBy: user._id } },
        { new: true }
      ).select("_id");
      if (!updated) return;

      socket.to(roomId).emit("message-read", { messageId, userId: user._id });
    } catch (err) {
      console.error("mark-read error:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const next = Math.max(0, (onlineCounts.get(user._id) ?? 1) - 1);
      if (next === 0) {
        onlineCounts.delete(user._id);
        const lastSeen = new Date();
        await User.findByIdAndUpdate(user._id, { isOnline: false, lastSeen });
        socket.broadcast.emit("user-offline", { userId: user._id, lastSeen });
      } else {
        onlineCounts.set(user._id, next);
      }
    } catch (err) {
      console.error("disconnect error:", err);
    }
  });
}
