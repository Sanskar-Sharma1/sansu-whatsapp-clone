import { Request, Response } from "express";
import {
  findOrCreateDM,
  createGroup,
  getUserRooms,
  getRoomMessages,
  isRoomMember,
} from "./room.service";
import { ApiError } from "../../utils/ApiError";
import { assertObjectId } from "../../utils/objectId";

export async function createDMController(req: Request, res: Response) {
  const { targetUserId } = req.body;
  if (!targetUserId) throw new ApiError(400, "targetUserId is required");
  assertObjectId(targetUserId, "targetUserId");

  const room = await findOrCreateDM(req.user!._id, targetUserId);
  res.json({ room });
}

export async function createGroupController(req: Request, res: Response) {
  const { name, memberIds } = req.body;
  if (!name || !Array.isArray(memberIds) || memberIds.length === 0) {
    throw new ApiError(400, "name and memberIds[] are required");
  }
  memberIds.forEach((id) => assertObjectId(id, "memberId"));

  const room = await createGroup(name, memberIds, req.user!._id);
  res.status(201).json({ room });
}

export async function getMyRoomsController(req: Request, res: Response) {
  const rooms = await getUserRooms(req.user!._id);
  res.json({ rooms });
}

export async function getRoomMessagesController(req: Request, res: Response) {
  const roomId = assertObjectId(req.query["roomId"], "roomId");

  // Authorization: only members may read a room's history (prevents IDOR).
  if (!(await isRoomMember(roomId, req.user!._id))) {
    throw new ApiError(403, "You are not a member of this room");
  }

  const messages = await getRoomMessages(roomId);
  res.json({ messages });
}
