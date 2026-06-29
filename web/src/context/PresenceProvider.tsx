import { useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { useSocket } from "../hooks/useSocket";
import { PresenceContext } from "./presence-context";
import type { PresencePayload } from "../types";

/**
 * Listens once for presence broadcasts and exposes a live online lookup, so the
 * sidebar and chat header reflect connect/disconnect without refetching.
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const [online, setOnline] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!socket) return;
    const onOnline = ({ userId }: PresencePayload) =>
      setOnline((prev) => new Map(prev).set(userId, true));
    const onOffline = ({ userId }: PresencePayload) =>
      setOnline((prev) => new Map(prev).set(userId, false));

    socket.on("user-online", onOnline);
    socket.on("user-offline", onOffline);
    return () => {
      socket.off("user-online", onOnline);
      socket.off("user-offline", onOffline);
    };
  }, [socket]);

  const isOnline = useCallback(
    (userId: string, fallback = false) => (online.has(userId) ? online.get(userId)! : fallback),
    [online]
  );

  const value = useMemo(() => ({ isOnline }), [isOnline]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}
