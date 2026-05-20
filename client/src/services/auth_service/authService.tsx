import apiClient from '../api/apiClient';
import {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  setCurrentUser,
  getCurrentUser,
  clearTokens
} from './TokenStorage';
type LoginData = { email: string; password: string };
type RegisterData = { email: string; password: string, [key: string]: any };
type AuthResponse = { access_token: string; refresh_token?: string; user?: any };
class AuthService {
  // Login method
  static async login({ email, password }: LoginData) {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', new URLSearchParams({ username: email, password }));
      setAccessToken(res.data.access_token);
      if (res.data.refresh_token) setRefreshToken(res.data.refresh_token);
      if (res.data.user) setCurrentUser(res.data.user);
      return res.data;
    } catch (error: any) {
      clearTokens();
      throw error.response?.data?.detail || error.message;
    }
  }
  // Register, if endpoint exists
  static async register({ email, password, ...rest }: RegisterData) {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/register', { email, password, ...rest });
      setAccessToken(res.data.access_token);
      if (res.data.refresh_token) setRefreshToken(res.data.refresh_token);
      if (res.data.user) setCurrentUser(res.data.user);
      return res.data;
    } catch (error: any) {
      throw error.response?.data?.detail || error.message;
    }
  }
  // Logout
  static logout() {
    clearTokens();
  }
  // Util to check authentication
  static isAuthenticated(): boolean {
    // Optionally, you may decode and check token expiry here
    return !!getAccessToken();
  }
  // Get user info
  static getCurrentUser() {
    return getCurrentUser();
  }
  // Get access token
  static getAccessToken() {
    return getAccessToken();
  }
}
export default AuthService;