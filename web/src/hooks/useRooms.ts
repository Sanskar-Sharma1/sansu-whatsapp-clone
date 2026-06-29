import { useEffect, useState } from "react";
import { getRoomsRequest } from "../api/rooms.api";
import { getApiErrorMessage } from "../utils/apiError";
import type { IRoom } from "../types";

/**
 * Owns the current user's room list with loading + error state. Exposes
 * `setRooms` so the sidebar can optimistically add a newly created DM/group.
 */
export function useRooms() {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRoomsRequest()
      .then((res) => !cancelled && setRooms(res.rooms))
      .catch((err) => !cancelled && setError(getApiErrorMessage(err, "Couldn't load chats")))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { rooms, setRooms, isLoading, error };
}
