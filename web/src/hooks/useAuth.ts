import { useContext } from "react";
import { AuthContext } from "../features/auth/auth-context";

export function useAuth() {
  return useContext(AuthContext);
}
