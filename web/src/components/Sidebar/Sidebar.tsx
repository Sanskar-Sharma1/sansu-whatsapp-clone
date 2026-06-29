import { useState } from "react";
import { Plus, LogOut, Users } from "lucide-react";
import type { IRoom } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../shared/Avatar";
import { IconButton } from "../shared/IconButton";
import { PanelHeader } from "../shared/PanelHeader";
import { EmptyState } from "../shared/EmptyState";
import { Spinner } from "../shared/Spinner";
import { UserList } from "./UserList";
import { RoomList } from "./RoomList";
import { CreateGroupModal } from "./CreateGroupModal";

type Tab = "dms" | "groups";

const TABS: { id: Tab; label: string }[] = [
  { id: "dms", label: "Direct Messages" },
  { id: "groups", label: "Groups" },
];

interface SidebarProps {
  rooms: IRoom[];
  activeRoom: IRoom | null;
  onRoomSelect: (room: IRoom) => void;
  onRoomsUpdate: (rooms: IRoom[]) => void;
  isLoadingRooms: boolean;
  roomsError: string | null;
  className?: string;
}

export function Sidebar({
  rooms,
  activeRoom,
  onRoomSelect,
  onRoomsUpdate,
  isLoadingRooms,
  roomsError,
  className = "",
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("dms");
  const [showGroupModal, setShowGroupModal] = useState(false);

  const groupRooms = rooms.filter((r) => r.type === "group");

  const handleGroupCreated = (room: IRoom) => {
    onRoomsUpdate([room, ...rooms]);
    onRoomSelect(room);
    setShowGroupModal(false);
  };

  const handleDMSelect = (room: IRoom) => {
    if (!rooms.some((r) => r._id === room._id)) onRoomsUpdate([room, ...rooms]);
    onRoomSelect(room);
  };

  return (
    <aside
      aria-label="Conversations"
      className={`h-full w-full flex-col border-r border-line bg-panel md:w-80 ${className}`}
    >
      <PanelHeader>
        <Avatar name={user?.name ?? "Me"} avatarUrl={user?.avatarUrl} size={36} />
        <span className="flex-1 truncate font-semibold text-fg">{user?.name ?? "Chats"}</span>
        <IconButton label="New group" onClick={() => setShowGroupModal(true)}>
          <Plus size={20} />
        </IconButton>
        <IconButton label="Log out" onClick={logout}>
          <LogOut size={18} />
        </IconButton>
      </PanelHeader>

      <div role="tablist" aria-label="Conversation type" className="flex border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-b-2 border-brand text-brand"
                : "text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="flex-1 overflow-y-auto">
        {tab === "dms" ? (
          <UserList activeRoom={activeRoom} onRoomSelect={handleDMSelect} />
        ) : isLoadingRooms ? (
          <div className="flex justify-center py-10 text-muted">
            <Spinner />
          </div>
        ) : roomsError ? (
          <EmptyState icon={Users} title="Couldn't load chats" description={roomsError} />
        ) : (
          <RoomList
            rooms={groupRooms}
            activeRoom={activeRoom}
            currentUserId={user?._id ?? ""}
            onRoomSelect={onRoomSelect}
          />
        )}
      </div>

      {showGroupModal && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </aside>
  );
}
