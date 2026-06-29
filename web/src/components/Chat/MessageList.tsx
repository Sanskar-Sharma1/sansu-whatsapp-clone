import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import type { IMessage } from "../../types";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "../shared/EmptyState";
import { Spinner } from "../shared/Spinner";

interface MessageListProps {
  messages: IMessage[];
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function MessageList({ messages, currentUserId, isLoading, error }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || messages.length === 0) return;

    // Jump to the latest on first load; afterwards only follow new messages if
    // the user is already near the bottom (don't yank them out of history).
    if (!didInitialScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      didInitialScroll.current = true;
      return;
    }
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 150) {
      bottomRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-danger">
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState icon={MessageCircle} title="No messages yet" description="Say hi 👋" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      className="flex-1 space-y-1 overflow-y-auto px-4 py-3"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.clientId ?? message._id}
          message={message}
          isOwn={message.senderId._id === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
