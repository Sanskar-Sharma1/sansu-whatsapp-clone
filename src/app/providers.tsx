import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../features/auth/AuthContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="360050562859-gm0ath3gsero6a9cn4jdvs09hrfv7tiu.apps.googleusercontent.com">
        {children}
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}
