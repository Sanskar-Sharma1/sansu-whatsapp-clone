import { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import ChatListPanel from "./ChatListPanel";
import ChatWindow from "./ChatWindow";
import { fetchChats } from "./chats.api";

const ChatsList = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchChats();
      setChats(data);
      if (data.length) setSelectedChat(data[0]);
    }
    load();
  }, []);

  return (
    <div className="h-screen w-full bg-[#0b141a] text-white flex overflow-hidden">
      <SidebarNav />
      <ChatListPanel
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        chats={chats}
      />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
};

export default ChatsList;
