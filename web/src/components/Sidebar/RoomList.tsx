import { Users } from "lucide-react";
import type { IRoom } from "../../types";
import { getRoomMeta } from "../../utils/room";
import { ListRow } from "../shared/ListRow";
import { EmptyState } from "../shared/EmptyState";

interface RoomListProps {
  rooms: IRoom[];
  activeRoom: IRoom | null;
  currentUserId: string;
  onRoomSelect: (room: IRoom) => void;
}

export function RoomList({ rooms, activeRoom, currentUserId, onRoomSelect }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No groups yet"
        description="Create one with the + button above."
      />
    );
  }

  return (
    <div className="flex flex-col">
      {rooms.map((room) => {
        const meta = getRoomMeta(room, currentUserId);
        return (
          <ListRow
            key={room._id}
            avatarName={meta.displayName}
            avatarUrl={meta.avatarUrl}
            title={meta.displayName}
            subtitle={meta.subtitle}
            active={activeRoom?._id === room._id}
            onClick={() => onRoomSelect(room)}
          />
        );
      })}
    </div>
  );
}
