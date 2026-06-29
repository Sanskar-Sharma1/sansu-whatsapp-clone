import { useContext } from "react";
import { PresenceContext } from "../context/presence-context";

export function usePresence() {
  return useContext(PresenceContext);
}
