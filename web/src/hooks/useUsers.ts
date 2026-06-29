import { useEffect, useState } from "react";
import { getUsersRequest } from "../api/users.api";
import { getApiErrorMessage } from "../utils/apiError";
import type { IUser } from "../types";

/** Loads all users (except the current one) with loading + error state. */
export function useUsers() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUsersRequest()
      .then((res) => !cancelled && setUsers(res.users))
      .catch((err) => !cancelled && setError(getApiErrorMessage(err, "Couldn't load users")))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { users, isLoading, error };
}
