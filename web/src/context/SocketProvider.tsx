import { useEffect, useState, useMemo, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { SocketContext } from "./socket-context";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Socket lives in state (not a ref) so consumers re-render when it connects.
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Auth travels on the httpOnly cookie via withCredentials.
    const s = io(SOCKET_URL, { withCredentials: true });
    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));
    // Storing the connection handle in state is intentional: consumers must
    // re-render (and re-run their [socket] effects) once it exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
