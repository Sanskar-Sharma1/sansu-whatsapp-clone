import { Server as SocketServer, Socket } from "socket.io";
import { Types } from "mongoose";
import { Message } from "../models/Message.model";
import { Room } from "../models/Room.model";
import { User } from "../models/User.model";
import { isRoomMember } from "../modules/rooms/room.service";
import { createRoomMessage } from "../services/message.service";
import { ApiError } from "../utils/ApiError";
import {
  SendMessagePayload,
  TypingPayload,
  MarkRoomReadPayload,
  JoinRoomPayload,
} from "../types/socket.types";

const MAX_CLIENT_ID_LENGTH = 100;

/**
 * Live socket count per user. Presence only flips on the first connect (0→1)
 * and the last disconnect (1→0), so a second browser tab can't mark the user
 * offline while they're still connected elsewhere.
 */
const onlineCounts = new Map<string, number>();

function isValidId(id: unknown): id is string {
  return typeof id === "string" && Types.ObjectId.isValid(id);
}

function isValidClientId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= MAX_CLIENT_ID_LENGTH;
}

/**
 * Socket equivalent of the HTTP error handler: an `ApiError` is a message the
 * user should see, anything else is a bug we log and generalise.
 */
function emitError(socket: Socket, err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    socket.emit("error", { message: err.message });
    return;
  }
  console.error(`${fallback}:`, err);
  socket.emit("error", { message: fallback });
}

export function registerSocketHandlers(_io: SocketServer, socket: Socket) {
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

    // Coming online delivers everything that piled up while we were away.
    await flushUndelivered(rooms.map((r) => r._id));
  }

  /**
   * Marks every message in `roomIds` that this user hasn't received yet as
   * delivered, then tells each room's senders so their ticks advance to two.
   */
  async function flushUndelivered(roomIds: Types.ObjectId[]) {
    if (!roomIds.length) return;

    const pending = await Message.find({
      roomId: { $in: roomIds },
      senderId: { $ne: user._id },
      deliveredTo: { $ne: user._id },
    })
      .select("_id roomId")
      .lean();
    if (!pending.length) return;

    await Message.updateMany(
      { _id: { $in: pending.map((m) => m._id) } },
      { $addToSet: { deliveredTo: user._id } }
    );

    // One event per room — senders only track the rooms they're looking at.
    const byRoom = new Map<string, string[]>();
    for (const m of pending) {
      const key = m.roomId.toString();
      byRoom.set(key, [...(byRoom.get(key) ?? []), m._id.toString()]);
    }
    for (const [roomId, messageIds] of byRoom) {
      socket.to(roomId).emit("messages-delivered", { roomId, messageIds, userId: user._id });
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
    const { roomId, content, uploadId, clientId } = payload ?? {};
    try {
      const message = await createRoomMessage({
        roomId,
        senderId: user._id,
        content,
        uploadId,
        isOnline: (userId) => onlineCounts.has(userId),
      });
      const saved = message.toObject();

      // Everyone else gets the plain message; the sender gets its clientId echoed
      // back so it can reconcile its optimistic bubble instead of appending a copy.
      socket.to(roomId).emit("receive-message", saved);
      socket.emit("receive-message", isValidClientId(clientId) ? { ...saved, clientId } : saved);
    } catch (err) {
      emitError(socket, err, "Failed to send message");
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

  /**
   * The user is looking at the room, so everything in it is read. Emitted on
   * open and on each new message, which covers the backlog a per-message ack
   * would miss (messages that arrived while the room was closed).
   */
  socket.on("mark-room-read", async ({ roomId }: MarkRoomReadPayload) => {
    try {
      if (!isValidId(roomId)) return;
      if (!(await isRoomMember(roomId, user._id))) return;

      // Scoped by roomId, so a user can only ever touch their own rooms.
      const unread = await Message.find({
        roomId,
        senderId: { $ne: user._id },
        readBy: { $ne: user._id },
      })
        .select("_id")
        .lean();
      if (!unread.length) return;

      const messageIds = unread.map((m) => m._id.toString());
      // Reading implies receiving — keep both sets consistent for refreshes.
      await Message.updateMany(
        { _id: { $in: unread.map((m) => m._id) } },
        { $addToSet: { deliveredTo: user._id, readBy: user._id } }
      );

      socket.to(roomId).emit("messages-read", { roomId, messageIds, userId: user._id });
    } catch (err) {
      console.error("mark-room-read error:", err);
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
