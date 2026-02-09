import {
  MessageCircle,
  Phone,
  CircleDashed,
  Archive,
  Star,
  Settings,
} from "lucide-react";

const SidebarNav = () => {
  return (
    <div className="w-17.5 bg-[#202c33] flex flex-col items-center py-4 gap-6 border-r border-[#2a3942]">
      <MessageCircle className="text-[#00a884] cursor-pointer" />
      <Phone className="opacity-70 cursor-pointer" />
      <CircleDashed className="opacity-70 cursor-pointer" />
      <Archive className="opacity-70 cursor-pointer" />
      <Star className="opacity-70 cursor-pointer" />

      <div className="mt-auto">
        <Settings className="opacity-70 cursor-pointer" />
      </div>
    </div>
  );
};

export default SidebarNav;
