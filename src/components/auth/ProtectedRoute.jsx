import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { rolesForPath, firstPathForRole } from "@/config/navigation";

export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const allowedRoles = rolesForPath(location.pathname);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={firstPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
