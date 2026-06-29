import { createContext } from "react";

export interface PresenceContextType {
  /** Live online state for a user, falling back to the last-known value. */
  isOnline: (userId: string, fallback?: boolean) => boolean;
}

export const PresenceContext = createContext<PresenceContextType>({
  isOnline: (_userId, fallback = false) => fallback,
});
