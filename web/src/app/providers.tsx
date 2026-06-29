import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../features/auth/AuthProvider";
import { SocketProvider } from "../context/SocketProvider";
import { PresenceProvider } from "../context/PresenceProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <SocketProvider>
          <PresenceProvider>{children}</PresenceProvider>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
