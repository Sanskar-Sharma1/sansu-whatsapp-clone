import { Message, IMessage } from "../models/Message.model";
import { Room } from "../models/Room.model";
import { ApiError } from "../utils/ApiError";
import { assertObjectId } from "../utils/objectId";
import { claimUpload } from "./file.service";

export const MAX_CONTENT_LENGTH = 5000;

interface CreateRoomMessageInput {
  roomId: string;
  senderId: string;
  /** Body text, or the caption when an attachment is present. */
  content?: string;
  /** Handle from `POST /files/uploadFile`; resolved server-side. */
  uploadId?: string;
  /** Members holding a live socket right now — they receive it immediately. */
  isOnline: (userId: string) => boolean;
}

/**
 * The one place a message is created.
 *
 * Everything a client sends is either authorized (`roomId`, `uploadId`) or
 * inert (`content`); the sender, the message type and all attachment metadata
 * are derived here, never accepted from the wire.
 */
export async function createRoomMessage({
  roomId,
  senderId,
  content,
  uploadId,
  isOnline,
}: CreateRoomMessageInput): Promise<IMessage> {
  assertObjectId(roomId, "roomId");

  const text = typeof content === "string" ? content.trim() : "";
  if (text.length > MAX_CONTENT_LENGTH) {
    throw new ApiError(400, "Message too long");
  }

  // Authorizes the sender and yields the member list in one round trip.
  const room = await Room.findOne({ _id: roomId, members: senderId })
    .select("members")
    .lean();
  if (!room) {
    throw new ApiError(403, "Not a room member");
  }

  // The upload record — not the payload — decides the type and the file fields.
  const upload = uploadId ? await claimUpload(uploadId, senderId) : null;
  if (!upload && !text) {
    throw new ApiError(400, "Cannot send an empty message");
  }

  const deliveredTo = room.members.filter(
    (member) => member.toString() === senderId || isOnline(member.toString())
  );

  const message = await Message.create({
    roomId,
    senderId,
    content: text,
    type: upload?.messageType ?? "text",
    fileUrl: upload?.fileUrl,
    fileName: upload?.fileName,
    fileSize: upload?.fileSize,
    mimeType: upload?.mimeType,
    deliveredTo,
    readBy: [senderId],
  });

  return message.populate("senderId", "name email avatarUrl");
}
