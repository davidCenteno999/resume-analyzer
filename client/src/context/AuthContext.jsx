import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth_service/authService";
import UserService from "../services/user_service/userService";
import {
  getAccessToken,
  getCurrentUser,
  setCurrentUser,
  clearTokens,
} from "../services/auth_service/tokenStorage";
import { isTokenExpired } from "../utils/jwtHelpers";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
      clearTokens();
      return null;
    }
    return getCurrentUser();
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
      clearTokens();
      setUser(null);
    }
  }, []);

  const login = async (username, password) => {
    try {
      await AuthService.login({ email: username, password });
      const currentUser = await UserService.get();
      const userData = currentUser.data ?? currentUser;
      setUser(userData);
      setCurrentUser(userData);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    clearTokens();
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
