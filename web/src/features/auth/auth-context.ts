import { createContext } from "react";
import type { IUser } from "../../types";

export interface AuthContextType {
  user: IUser | null;
  isAuthLoading: boolean;
  login: (user: IUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthLoading: true,
  login: () => {},
  logout: () => {},
});
