import { memo, useState } from "react";
import { FileText, Download, Check, CheckCheck, Clock, ImageOff } from "lucide-react";
import type { IMessage } from "../../types";
import { Avatar } from "../shared/Avatar";
import { formatBytes, formatTime } from "../../utils/format";

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
}

function ChatImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-32 w-48 items-center justify-center rounded-lg bg-black/20 text-muted">
        <ImageOff size={28} aria-hidden="true" />
      </div>
    );
  }
  return (
    <a href={src} target="_blank" rel="noreferrer">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-h-80 w-full max-w-[min(75vw,320px)] rounded-lg object-cover transition-opacity hover:opacity-90"
      />
    </a>
  );
}

function MessageMedia({ message }: { message: IMessage }) {
  switch (message.type) {
    case "image":
      return <ChatImage src={message.fileUrl} alt={message.fileName ?? "Shared image"} />;
    case "video":
      return (
        <video
          src={message.fileUrl}
          controls
          className="max-h-80 w-full max-w-[min(75vw,320px)] rounded-lg"
        />
      );
    case "pdf":
      return (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noreferrer"
          download={message.fileName}
          className="flex min-w-48 items-center gap-3 rounded-lg bg-black/20 p-3 transition-colors hover:bg-black/30"
        >
          <FileText className="shrink-0" size={28} aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{message.fileName}</p>
            {message.fileSize !== undefined && (
              <p className="text-xs opacity-70">{formatBytes(message.fileSize)} · PDF</p>
            )}
          </div>
          <Download className="ml-auto shrink-0 opacity-70" size={16} aria-hidden="true" />
        </a>
      );
    default:
      return <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>;
  }
}

function ReadReceipt({ message }: { message: IMessage }) {
  if (message.pending) return <Clock size={13} aria-label="Sending" />;
  const readByOthers = message.readBy.some((id) => id !== message.senderId._id);
  return readByOthers ? (
    <CheckCheck size={14} className="text-sky-300" aria-label="Read" />
  ) : (
    <Check size={14} aria-label="Sent" />
  );
}

function MessageBubbleBase({ message, isOwn }: MessageBubbleProps) {
  const sender = message.senderId;

  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {!isOwn && (
        <div className="shrink-0 self-end">
          <Avatar name={sender.name} avatarUrl={sender.avatarUrl} size={28} />
        </div>
      )}

      <div className="flex max-w-[min(75%,28rem)] flex-col">
        {!isOwn && <span className="mb-0.5 ml-1 text-xs text-brand">{sender.name}</span>}
        <div
          className={`rounded-[var(--radius-bubble)] px-3 py-2 text-fg ${
            isOwn ? "rounded-tr-sm bg-bubble-out" : "rounded-tl-sm bg-surface"
          } ${message.pending ? "opacity-70" : ""}`}
        >
          <MessageMedia message={message} />
          <div className="mt-1 flex items-center justify-end gap-1 text-[0.65rem] opacity-70">
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && <ReadReceipt message={message} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoized: a new incoming message shouldn't re-render the whole history.
export const MessageBubble = memo(MessageBubbleBase);
