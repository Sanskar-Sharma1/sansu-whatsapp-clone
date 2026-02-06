import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatsList from "../features/chats/ChatsList";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import Login from "../features/auth/Login";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatsList />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
