/**
 * Centralized backend base URL. Every API request builds its URL from this so
 * there are no hardcoded `/api/...` strings scattered across the API layer.
 * Reads Vite's `VITE_API_URL`, falling back to the local dev server.
 */
export const getBackendUrl = (): string =>
  import.meta.env.VITE_API_URL ?? "http://localhost:4000";
