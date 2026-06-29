import axios from "axios";

/**
 * Cookie-based auth: the server sets an httpOnly `authToken` cookie and we send
 * it automatically with `withCredentials`. No token is kept in JS (no XSS surface).
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  withCredentials: true,
});

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Registered by AuthProvider so a 401 can clear session state via the router. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url: string = err.config?.url ?? "";
    // Auth-endpoint 401s (e.g. /me on first load, a wrong password) are expected
    // and handled by their callers — don't treat them as session expiry.
    const isAuthRoute = url.includes("/auth/");
    if (status === 401 && !isAuthRoute) {
      onUnauthorized?.();
    }
    return Promise.reject(err);
  }
);
