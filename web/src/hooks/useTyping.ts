import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "./useAuth";
import type { IRoom, TypingPayload } from "../types";

// How long a remote "typing" lasts before we assume they stopped.
const TYPING_EXPIRY = 3000;
// How long after the last keystroke we emit "stop-typing".
const STOP_DEBOUNCE = 2000;

/**
 * Tracks who is typing in the active room and exposes debounced emitters for
 * the current user's own typing. The outbound stop-typing debounce lives here
 * (not in the input component) and is cleaned up on room change / unmount.
 */
export function useTyping(room: IRoom | null) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const roomId = room?._id ?? null;

  const [typingNames, setTypingNames] = useState<Map<string, string>>(new Map());
  const expiryTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket || !roomId) return;
    const timers = expiryTimers.current;

    const onTyping = ({ userId, name, roomId: incomingRoom }: TypingPayload) => {
      if (incomingRoom !== roomId || userId === user?._id) return;
      setTypingNames((prev) => new Map(prev).set(userId, name));

      clearTimeout(timers.get(userId));
      timers.set(
        userId,
        setTimeout(() => {
          setTypingNames((prev) => {
            const next = new Map(prev);
            next.delete(userId);
            return next;
          });
          timers.delete(userId);
        }, TYPING_EXPIRY)
      );
    };

    const onStop = ({ userId }: { userId: string }) => {
      setTypingNames((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
      clearTimeout(timers.get(userId));
      timers.delete(userId);
    };

    socket.on("user-typing", onTyping);
    socket.on("user-stop-typing", onStop);
    return () => {
      socket.off("user-typing", onTyping);
      socket.off("user-stop-typing", onStop);
      timers.forEach(clearTimeout);
      timers.clear();
      // Reset typing state when leaving the room (runs before the next room's effect).
      setTypingNames(new Map());
    };
  }, [socket, roomId, user?._id]);

  // Clear the outbound debounce when the room changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      stopTimer.current = null;
    };
  }, [roomId]);

  const notifyTyping = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit("typing", { roomId });
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      socket.emit("stop-typing", { roomId });
      stopTimer.current = null;
    }, STOP_DEBOUNCE);
  }, [socket, roomId]);

  const notifyStopTyping = useCallback(() => {
    if (!socket || !roomId) return;
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
    socket.emit("stop-typing", { roomId });
  }, [socket, roomId]);

  return { typingNames: Array.from(typingNames.values()), notifyTyping, notifyStopTyping };
}
