import { useState } from "react";
import { Users } from "lucide-react";
import { createDirectMessageRequest } from "../../api/rooms.api";
import { useUsers } from "../../hooks/useUsers";
import { usePresence } from "../../hooks/usePresence";
import { getApiErrorMessage } from "../../utils/apiError";
import type { IUser, IRoom } from "../../types";
import { ListRow } from "../shared/ListRow";
import { EmptyState } from "../shared/EmptyState";
import { Spinner } from "../shared/Spinner";

interface UserListProps {
  activeRoom: IRoom | null;
  onRoomSelect: (room: IRoom) => void;
}

export function UserList({ activeRoom, onRoomSelect }: UserListProps) {
  const { users, isLoading, error } = useUsers();
  const { isOnline } = usePresence();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleUserClick = async (user: IUser) => {
    setActionError(null);
    try {
      const { room } = await createDirectMessageRequest({ targetUserId: user._id });
      onRoomSelect(room);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Couldn't open that chat"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10 text-muted">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={Users} title="Couldn't load people" description={error} />;
  }

  if (users.length === 0) {
    return (
      <EmptyState icon={Users} title="No one here yet" description="Invite a friend to start chatting." />
    );
  }

  const isActiveDM = (userId: string) =>
    activeRoom?.type === "dm" && activeRoom.members.some((m) => m._id === userId);

  return (
    <div className="flex flex-col">
      {actionError && (
        <p role="alert" className="px-4 py-2 text-xs text-danger">
          {actionError}
        </p>
      )}
      {users.map((user) => (
        <ListRow
          key={user._id}
          avatarName={user.name}
          avatarUrl={user.avatarUrl}
          title={user.name}
          subtitle={user.email}
          isOnline={isOnline(user._id, user.isOnline)}
          active={isActiveDM(user._id)}
          onClick={() => handleUserClick(user)}
        />
      ))}
    </div>
  );
}
