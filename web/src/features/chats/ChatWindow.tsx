
const ChatWindow = ({selectedChat}: any) => {
  return (
    <div className="flex-1 flex flex-col bg-[#0b141a]">
      {/* Chat Header */}
      <div className="h-15 border-b border-[#2a3942] flex items-center px-4 gap-3 bg-[#202c33]">
        <img src={selectedChat.avatar} className="w-10 h-10 rounded-full" />
        <div className="font-medium">{selectedChat.name}</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex items-center justify-center text-center opacity-40">
        <div>
          <div className="text-2xl mb-2">WhatsApp Web UI Clone</div>
          <div className="text-sm">Select a chat to start messaging</div>
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-[#2a3942] bg-[#202c33] flex gap-3">
        <input
          placeholder="Type a message"
          className="flex-1 bg-[#2a3942] px-4 py-2 rounded-lg outline-none text-sm"
        />
        <button className="bg-[#00a884] px-4 rounded-lg text-black text-sm font-medium">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
