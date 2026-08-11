import { Types } from "mongoose";
import { Room, IRoom } from "../../models/Room.model";
import { Message } from "../../models/Message.model";

export async function findOrCreateDM(
  currentUserId: string,
  targetUserId: string
): Promise<IRoom> {
  return Room.findOrCreateDM(currentUserId, targetUserId);
}

export async function createGroup(
  name: string,
  memberIds: string[],
  createdBy: string
): Promise<IRoom> {
  const members = memberIds.map((id) => new Types.ObjectId(id));
  if (!members.some((m) => m.equals(createdBy))) {
    members.push(new Types.ObjectId(createdBy));
  }
  return Room.create({ name, type: "group", members, createdBy });
}

export async function getUserRooms(userId: string) {
  const rooms = await Room.find({ members: userId })
    .populate("members", "name email avatarUrl isOnline lastSeen")
    .sort({ updatedAt: -1 })
    .lean();
  return rooms;
}

export async function getRoomMessages(roomId: string, limit = 50) {
  const messages = await Message.find({ roomId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate("senderId", "name email avatarUrl")
    .lean();
  // .lean() skips schema defaults, so messages written before `deliveredTo`
  // existed would arrive without it. Clients treat receipts as always-present.
  return messages.map((m) => ({ ...m, deliveredTo: m.deliveredTo ?? [] }));
}

export async function isRoomMember(
  roomId: string,
  userId: string
): Promise<boolean> {
  const room = await Room.findOne({
    _id: roomId,
    members: new Types.ObjectId(userId),
  }).lean();
  return !!room;
}
