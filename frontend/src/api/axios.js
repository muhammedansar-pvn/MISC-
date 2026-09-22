import axios from 'axios';
import { getToken, clearAuthStorage } from '../utils/token';

const baseURL =
  (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL)) ||
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized Error Handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    // Handle 401 Unauthorized for authenticated requests
    if (status === 401 && getToken()) {
      clearAuthStorage();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
