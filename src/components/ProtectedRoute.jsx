import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {

  const token = localStorage.getItem("token");

  // Get roles from localStorage
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but role not allowed
  if (allowedRoles && !roles.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Allowed
  return children;
}

export default ProtectedRoute;