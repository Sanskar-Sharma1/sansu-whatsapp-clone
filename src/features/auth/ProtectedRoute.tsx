import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ children }: any) {
  const { userId } = useContext(AuthContext);

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
