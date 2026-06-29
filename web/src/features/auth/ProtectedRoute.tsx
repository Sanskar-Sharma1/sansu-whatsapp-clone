import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/shared/Spinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-brand">
        <Spinner size={44} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
