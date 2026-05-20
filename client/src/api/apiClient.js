import axios from 'axios';
import { API_BASE_URL } from '../utils/env';
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens } from '../auth/TokenStorage';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Optional: Token refresh support
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        // Adjust the endpoint/method for your backend
        const response = await apiClient.post('/auth/refresh', { refresh_token: getRefreshToken() });
        const newAccessToken = response.data.access_token;
        setAccessToken(newAccessToken);
        if (response.data.refresh_token) setRefreshToken(response.data.refresh_token);
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
export default apiClient;