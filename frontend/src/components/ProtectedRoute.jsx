import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("medassist_token");
  const role = localStorage.getItem("medassist_role");

  console.log("Protected Route:");
  console.log("Token:", token);
  console.log("Role:", role);
  console.log("Allowed Roles:", allowedRoles);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;