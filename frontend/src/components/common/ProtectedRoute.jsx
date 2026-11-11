import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // 1. If auth is still loading, show a centered spinner/text
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading your account...</div>
      </div>
    );
  }

  // 2. If no user is found, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role check (Only if allowedRoles is passed)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user.roles?.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  // 4. Render the child route
  return <Outlet />;
}