import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { IUser } from "../../types";
import { getUserDetailsRequest, logoutRequest } from "../../api/auth.api";
import { setUnauthorizedHandler } from "../../services/axios";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Re-establish the session from the httpOnly cookie on first load.
  useEffect(() => {
    let cancelled = false;
    getUserDetailsRequest()
      .then(({ user: u }) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setIsAuthLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // A 401 on any non-auth request means the session expired → drop the user;
  // ProtectedRoute then redirects to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback((u: IUser) => setUser(u), []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Best effort — clear local state regardless.
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthLoading, login, logout }),
    [user, isAuthLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
