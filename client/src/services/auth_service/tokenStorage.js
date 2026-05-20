const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';
export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
export function setCurrentUser(user ) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getCurrentUser( ) {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}