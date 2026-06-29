import axios from "axios";

/**
 * Extracts a user-facing message from any thrown value. Prefers the backend's
 * `{ error }` body so users see "Email already in use" instead of
 * "Request failed with status code 409".
 */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? err.message ?? fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
