import { useState } from "react";
import type { IRoom } from "../types";
import { useRooms } from "../hooks/useRooms";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { ChatWindow } from "../components/Chat/ChatWindow";

export default function ChatPage() {
  const { rooms, setRooms, isLoading, error } = useRooms();
  const [activeRoom, setActiveRoom] = useState<IRoom | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas text-fg">
      <Sidebar
        className={activeRoom ? "hidden md:flex" : "flex"}
        rooms={rooms}
        activeRoom={activeRoom}
        onRoomSelect={setActiveRoom}
        onRoomsUpdate={setRooms}
        isLoadingRooms={isLoading}
        roomsError={error}
      />
      <ChatWindow
        className={activeRoom ? "flex" : "hidden md:flex"}
        activeRoom={activeRoom}
        onBack={() => setActiveRoom(null)}
      />
    </div>
  );
}
