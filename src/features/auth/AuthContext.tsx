import { createContext, ReactNode, useEffect, useState } from "react";

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

  // restore session
  useEffect(() => {
    const stored = localStorage.getItem("userId");
    if (stored) setUserId(stored);
  }, []);

  // persist session
  useEffect(() => {
    if (userId) localStorage.setItem("userId", userId);
    else localStorage.removeItem("userId");
  }, [userId]);

  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};
