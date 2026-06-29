import { ArrowLeft, MessagesSquare } from "lucide-react";
import type { IRoom } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { usePresence } from "../../hooks/usePresence";
import { useRoomMessages } from "../../hooks/useRoomMessages";
import { useTyping } from "../../hooks/useTyping";
import { getRoomMeta } from "../../utils/room";
import { Avatar } from "../shared/Avatar";
import { OnlineIndicator } from "../shared/OnlineIndicator";
import { IconButton } from "../shared/IconButton";
import { PanelHeader } from "../shared/PanelHeader";
import { EmptyState } from "../shared/EmptyState";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  activeRoom: IRoom | null;
  onBack: () => void;
  className?: string;
}

export function ChatWindow({ activeRoom, onBack, className = "" }: ChatWindowProps) {
  const { user } = useAuth();
  const { isOnline } = usePresence();
  const { messages, isLoading, error, sendError, isUploading, sendText, sendFile, clearSendError } =
    useRoomMessages(activeRoom);
  const { typingNames, notifyTyping, notifyStopTyping } = useTyping(activeRoom);

  if (!activeRoom || !user) {
    return (
      <section className={`flex-1 items-center justify-center bg-canvas ${className}`}>
        <EmptyState
          icon={MessagesSquare}
          title="Select a chat"
          description="Choose a conversation to start messaging."
        />
      </section>
    );
  }

  const meta = getRoomMeta(activeRoom, user._id);
  const isDM = activeRoom.type === "dm";
  const online = isDM && meta.otherUserId ? isOnline(meta.otherUserId, meta.isOnline) : false;

  return (
    <section
      aria-label={`Conversation with ${meta.displayName}`}
      className={`min-w-0 flex-1 flex-col bg-canvas ${className}`}
    >
      <PanelHeader>
        <IconButton label="Back to chats" onClick={onBack} className="md:hidden">
          <ArrowLeft size={20} />
        </IconButton>
        <div className="relative shrink-0">
          <Avatar name={meta.displayName} avatarUrl={meta.avatarUrl} size={40} />
          {isDM && <OnlineIndicator isOnline={online} />}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-medium text-fg">{meta.displayName}</h2>
          {isDM && online && <p className="text-xs text-brand">online</p>}
          {!isDM && <p className="truncate text-xs text-muted">{meta.subtitle}</p>}
        </div>
      </PanelHeader>

      <MessageList
        key={activeRoom._id}
        messages={messages}
        currentUserId={user._id}
        isLoading={isLoading}
        error={error}
      />

      <TypingIndicator names={typingNames} />

      {sendError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 bg-danger-surface px-4 py-2 text-xs text-danger"
        >
          <span>{sendError}</span>
          <button onClick={clearSendError} className="shrink-0 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      <MessageInput
        onSendText={sendText}
        onSendFile={sendFile}
        onTyping={notifyTyping}
        onStopTyping={notifyStopTyping}
        isUploading={isUploading}
      />
    </section>
  );
}
