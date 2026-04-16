import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children, admin = false }) => {
  const {
    user,
    admin: adminProfile,
    userLoading,
    adminLoading,
    isAdminAuthenticated
  } = useAuth();
  const loading = admin ? adminLoading : userLoading;
  const isAuthenticated = admin ? isAdminAuthenticated : Boolean(user);

  if (loading) {
    return <Loader label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={admin ? "/admin/login" : "/login"} replace />;
  }

  if (admin && !adminProfile) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
