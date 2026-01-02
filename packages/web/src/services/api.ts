import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// API configuration
// Use relative URL to leverage Vite's proxy in development
// In production, set VITE_API_URL to the full API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const TOKEN_KEY = 'auth_token';

// Custom error type for API errors
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string; error?: { message?: string; code?: string } }>) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
    };

    if (error.response) {
      // Server responded with error - check nested error object first
      const responseData = error.response.data;
      apiError.message = responseData?.error?.message || responseData?.message || getStatusMessage(error.response.status);
      apiError.code = responseData?.error?.code || responseData?.code;
      apiError.status = error.response.status;

      // Handle 401 Unauthorized - clear auth and redirect
      if (error.response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('auth_user');

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request made but no response
      apiError.message = 'Unable to reach the server. Please check your connection.';
      apiError.code = 'NETWORK_ERROR';
    } else {
      // Error in request setup
      apiError.message = error.message;
      apiError.code = 'REQUEST_ERROR';
    }

    return Promise.reject(apiError);
  }
);

// Helper to get user-friendly status messages
function getStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Please sign in to continue.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data.',
    422: 'The provided data is invalid.',
    429: 'Too many requests. Please try again later.',
    500: 'An internal server error occurred.',
    502: 'The server is temporarily unavailable.',
    503: 'The service is temporarily unavailable.',
  };
  return messages[status] || 'An unexpected error occurred.';
}

// Type-safe API helper functions
export const apiClient = {
  get: <T>(url: string, config?: Parameters<typeof api.get>[1]) =>
    api.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]) =>
    api.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: Parameters<typeof api.put>[2]) =>
    api.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: Parameters<typeof api.patch>[2]) =>
    api.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: Parameters<typeof api.delete>[1]) =>
    api.delete<T>(url, config).then((res) => res.data),
};

export default api;
