import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const TOKEN_KEY = 'misc_auth_token';
const USER_KEY = 'misc_auth_user';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if present in browser localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Ignore storage access errors in restricted browser contexts
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized 401 Session Handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response ? error.response.status : null;

    if (status === 401 && typeof window !== 'undefined') {
      try {
        if (localStorage.getItem(TOKEN_KEY)) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      } catch {
        // Ignore storage access errors
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
