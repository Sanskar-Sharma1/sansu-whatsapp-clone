import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../features/auth/AuthContext";
import { useAuthInit } from "../features/auth/useAuthInit";

function AuthInitializer({ children }: { children: ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthInitializer>
        <GoogleOAuthProvider clientId="360050562859-gm0ath3gsero6a9cn4jdvs09hrfv7tiu.apps.googleusercontent.com">
        {children}
      </GoogleOAuthProvider>
      </AuthInitializer>
    </AuthProvider>
  );
}
