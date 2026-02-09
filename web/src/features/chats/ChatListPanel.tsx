import { Button, Menu, MenuItem } from "@mui/material";
import { Search } from "lucide-react";
import { useState } from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ChatListPanel = ({ selectedChat, setSelectedChat, dummyChats }: any) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const threeDots = () => (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </div>
  );

  return (
    <div className="w-87.5 bg-[#111b21] border-r border-[#2a3942] flex flex-col">
      {/* Header */}
      <div className="flex p-4 border-b border-[#2a3942] justify-between text-lg font-semibold">
        <div>Chats</div>
        {/* {threeDots()} */}
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="flex items-center bg-[#202c33] px-3 py-2 rounded-lg gap-2">
          <Search size={18} className="opacity-60" />
          <input
            placeholder="Search or start new chat"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* Chat Users */}
      <div className="flex-1 overflow-y-auto">
        {dummyChats.map((chat: any) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#202c33] ${
              selectedChat.id === chat.id ? "bg-[#2a3942]" : ""
            }`}
          >
            <img src={chat.avatar} className="w-12 h-12 rounded-full" />

            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{chat.name}</span>
                <span className="text-xs opacity-60">{chat.time}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70 truncate w-45">
                  {chat.lastMsg}
                </span>

                {chat.unread > 0 && (
                  <span className="bg-[#00a884] text-black text-xs px-2 py-0.5 rounded-full">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatListPanel;
