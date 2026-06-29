import type { IRoom } from "../types";

export interface RoomMeta {
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  subtitle: string;
  /** The other member's id for a DM (undefined for groups). */
  otherUserId?: string;
}

/**
 * Derives how a room is presented to the current user. For a DM this is the
 * *other* member; for a group it's the group name + member count. Centralized
 * so the sidebar, room list, and chat header agree (and don't each re-derive it).
 */
export function getRoomMeta(room: IRoom, currentUserId: string): RoomMeta {
  if (room.type === "group") {
    const name = room.name ?? "Group";
    return {
      displayName: name,
      avatarUrl: undefined,
      isOnline: false,
      subtitle: `${room.members.length} members`,
    };
  }

  const other = room.members.find((m) => m._id !== currentUserId);
  return {
    displayName: other?.name ?? "Chat",
    avatarUrl: other?.avatarUrl,
    isOnline: other?.isOnline ?? false,
    subtitle: other?.email ?? "Direct message",
    otherUserId: other?._id,
  };
}
