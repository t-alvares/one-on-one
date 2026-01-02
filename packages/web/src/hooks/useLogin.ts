import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type ApiError } from '../services/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'IC' | 'LEADER' | 'ADMIN';
    isAdmin: boolean;
    avatarUrl: string | null;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Hook for handling user login with React Query
 * - Calls login API
 * - Saves auth state to context
 * - Redirects based on role
 */
export function useLogin() {
  const { login: setAuth } = useAuth();

  const mutation = useMutation<ApiResponse<LoginResponse>, ApiError, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    },
    onSuccess: (response) => {
      const { token, user } = response.data;

      // Save to auth context (also persists to localStorage)
      // Redirect is handled by LoginPage component based on mode
      setAuth(token, {
        ...user,
        avatarUrl: user.avatarUrl ?? undefined,
      });
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    isError: mutation.isError,
    reset: mutation.reset,
  };
}
