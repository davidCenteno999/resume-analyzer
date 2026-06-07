import { Navigate } from "react-router-dom";
import { getAccessToken } from "../services/auth_service/tokenStorage";
import { isTokenExpired } from "../utils/jwtHelpers";

export default function ProtectedRoute({ children }) {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
