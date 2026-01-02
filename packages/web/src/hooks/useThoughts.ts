import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiError } from '../services/api';
import type { PartialBlock } from '@blocknote/core';
import type { Label } from './useLabels';

// BlockNote content type (array of blocks)
export type EditorContent = PartialBlock[] | null;

// Thought types
export interface Thought {
  id: string;
  title: string;
  label: Label | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThoughtDetail extends Thought {
  content: EditorContent;
}

export interface CreateThoughtInput {
  title: string;
  content?: EditorContent;
  labelId?: string | null;
}

export interface UpdateThoughtInput {
  id: string;
  title?: string;
  content?: EditorContent;
  labelId?: string | null;
}

export interface PromoteThoughtResult {
  topic: {
    id: string;
    title: string;
    status: string;
  };
  thoughtDeleted: boolean;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Query keys for cache management
export const thoughtKeys = {
  all: ['thoughts'] as const,
  list: (params?: { labelId?: string }) => [...thoughtKeys.all, 'list', params] as const,
  detail: (id: string) => [...thoughtKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all thoughts (list view - titles only)
 */
export function useThoughts(params?: { labelId?: string }) {
  return useQuery<Thought[], ApiError>({
    queryKey: thoughtKeys.list(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.labelId) {
        queryParams.set('labelId', params.labelId);
      }
      const url = `/thoughts${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get<ApiResponse<Thought[]>>(url);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single thought with full content
 */
export function useThought(id: string | undefined) {
  return useQuery<ThoughtDetail, ApiError>({
    queryKey: thoughtKeys.detail(id!),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ThoughtDetail>>(`/thoughts/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to create a new thought
 */
export function useCreateThought() {
  const queryClient = useQueryClient();

  return useMutation<ThoughtDetail, ApiError, CreateThoughtInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<ThoughtDetail>>('/thoughts', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all thought list queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: thoughtKeys.all });
    },
  });
}

/**
 * Hook to update a thought
 */
export function useUpdateThought() {
  const queryClient = useQueryClient();

  return useMutation<ThoughtDetail, ApiError, UpdateThoughtInput>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<ThoughtDetail>>(`/thoughts/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedThought) => {
      // Update the detail cache
      queryClient.setQueryData(thoughtKeys.detail(updatedThought.id), updatedThought);

      // Invalidate all thought list queries to refresh with new data
      queryClient.invalidateQueries({ queryKey: thoughtKeys.all });
    },
  });
}

/**
 * Hook to delete a thought
 */
export function useDeleteThought() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      await apiClient.delete(`/thoughts/${id}`);
    },
    onSuccess: (_, { id }) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: thoughtKeys.detail(id) });
      // Invalidate all thought list queries
      queryClient.invalidateQueries({ queryKey: thoughtKeys.all });
    },
  });
}

/**
 * Hook to promote a thought to a topic
 */
export function usePromoteThought() {
  const queryClient = useQueryClient();

  return useMutation<PromoteThoughtResult, ApiError, { id: string; labelId?: string }>({
    mutationFn: async ({ id, labelId }) => {
      const response = await apiClient.post<ApiResponse<PromoteThoughtResult>>(
        `/thoughts/${id}/promote`,
        { labelId }
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Remove the thought from cache since it's now deleted
      queryClient.setQueryData<Thought[]>(thoughtKeys.list(), (old) => {
        if (!old) return [];
        return old.filter((thought) => thought.id !== id);
      });
      queryClient.removeQueries({ queryKey: thoughtKeys.detail(id) });

      // Invalidate topics to refresh the list
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
}

/**
 * Hook to reorder thoughts
 */
export function useReorderThoughts() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { orderedIds: string[] }>({
    mutationFn: async ({ orderedIds }) => {
      await apiClient.post('/thoughts/reorder', { orderedIds });
    },
    onSuccess: () => {
      // Invalidate all thought queries to refresh with new order
      queryClient.invalidateQueries({ queryKey: thoughtKeys.all });
    },
  });
}

/**
 * Helper hook to get a thought by ID from the list cache
 */
export function useThoughtById(id: string | null | undefined) {
  const { data: thoughts } = useThoughts();
  return thoughts?.find((thought) => thought.id === id) ?? null;
}
