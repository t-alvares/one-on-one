import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiError } from '../services/api';

// Label type
export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Query keys for cache management
export const labelKeys = {
  all: ['labels'] as const,
  list: () => [...labelKeys.all, 'list'] as const,
  detail: (id: string) => [...labelKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all labels
 */
export function useLabels() {
  return useQuery<Label[], ApiError>({
    queryKey: labelKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Label[]>>('/labels');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - labels don't change often
  });
}

/**
 * Hook to create a new label
 */
export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation<Label, ApiError, { name: string; color: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<Label>>('/labels', data);
      return response.data;
    },
    onSuccess: (newLabel) => {
      // Add the new label to the cache
      queryClient.setQueryData<Label[]>(labelKeys.list(), (old) => {
        if (!old) return [newLabel];
        return [...old, newLabel].sort((a, b) => a.name.localeCompare(b.name));
      });
    },
  });
}

/**
 * Hook to update a label
 */
export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation<Label, ApiError, { id: string; name?: string; color?: string }>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<Label>>(`/labels/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedLabel) => {
      // Update the label in the cache
      queryClient.setQueryData<Label[]>(labelKeys.list(), (old) => {
        if (!old) return [updatedLabel];
        return old
          .map((label) => (label.id === updatedLabel.id ? updatedLabel : label))
          .sort((a, b) => a.name.localeCompare(b.name));
      });
    },
  });
}

/**
 * Hook to delete a label
 */
export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string; force?: boolean }>({
    mutationFn: async ({ id, force = false }) => {
      await apiClient.delete(`/labels/${id}${force ? '?force=true' : ''}`);
    },
    onSuccess: (_, { id }) => {
      // Remove the label from the cache
      queryClient.setQueryData<Label[]>(labelKeys.list(), (old) => {
        if (!old) return [];
        return old.filter((label) => label.id !== id);
      });
    },
  });
}

/**
 * Helper hook to get a label by ID from the cache
 */
export function useLabelById(id: string | null | undefined) {
  const { data: labels } = useLabels();
  return labels?.find((label) => label.id === id) ?? null;
}
