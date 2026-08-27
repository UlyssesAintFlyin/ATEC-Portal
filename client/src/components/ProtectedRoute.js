import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Restricts a route to specific roles (e.g. ["Student"])
export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or a spinner

  if (!user) return <Navigate to="/signin" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}

// Restricts a route to guests only (e.g. /enrollment)
export function GuestOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}