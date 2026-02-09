import { createContext, ReactNode, useState } from "react";

type AuthContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
  userId: null,
  setUserId: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};
