import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken } from "../services/auth_service/tokenStorage";
import { isTokenExpired } from "../utils/jwtHelpers";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return children;
}
