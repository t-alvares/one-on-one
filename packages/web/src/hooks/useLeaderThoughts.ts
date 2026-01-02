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
  aboutIcId: string; // Required for leader thoughts
}

export interface UpdateThoughtInput {
  id: string;
  title?: string;
  content?: EditorContent;
  labelId?: string | null;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Query keys for cache management
export const leaderThoughtKeys = {
  all: ['leader-thoughts'] as const,
  list: (aboutIcId: string, params?: { labelId?: string }) =>
    [...leaderThoughtKeys.all, 'list', aboutIcId, params] as const,
  detail: (id: string) => [...leaderThoughtKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch leader's thoughts about a specific IC
 */
export function useLeaderThoughts(aboutIcId: string | undefined, params?: { labelId?: string }) {
  return useQuery<Thought[], ApiError>({
    queryKey: leaderThoughtKeys.list(aboutIcId!, params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set('aboutIcId', aboutIcId!);
      if (params?.labelId) {
        queryParams.set('labelId', params.labelId);
      }
      const url = `/thoughts?${queryParams}`;
      const response = await apiClient.get<ApiResponse<Thought[]>>(url);
      return response.data;
    },
    enabled: !!aboutIcId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single thought with full content
 */
export function useLeaderThought(id: string | undefined) {
  return useQuery<ThoughtDetail, ApiError>({
    queryKey: leaderThoughtKeys.detail(id!),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ThoughtDetail>>(`/thoughts/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a new thought about an IC
 */
export function useCreateLeaderThought() {
  const queryClient = useQueryClient();

  return useMutation<ThoughtDetail, ApiError, CreateThoughtInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<ThoughtDetail>>('/thoughts', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate leader thought list for this IC
      queryClient.invalidateQueries({
        queryKey: leaderThoughtKeys.list(variables.aboutIcId),
      });
    },
  });
}

/**
 * Hook to update a thought
 */
export function useUpdateLeaderThought(aboutIcId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<ThoughtDetail, ApiError, UpdateThoughtInput>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<ThoughtDetail>>(`/thoughts/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedThought) => {
      // Update the detail cache
      queryClient.setQueryData(leaderThoughtKeys.detail(updatedThought.id), updatedThought);
      // Invalidate list to refresh
      if (aboutIcId) {
        queryClient.invalidateQueries({
          queryKey: leaderThoughtKeys.list(aboutIcId),
        });
      }
    },
  });
}

/**
 * Hook to delete a thought
 */
export function useDeleteLeaderThought(aboutIcId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      await apiClient.delete(`/thoughts/${id}`);
    },
    onSuccess: (_, { id }) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: leaderThoughtKeys.detail(id) });
      // Invalidate list
      if (aboutIcId) {
        queryClient.invalidateQueries({
          queryKey: leaderThoughtKeys.list(aboutIcId),
        });
      }
    },
  });
}

/**
 * Hook to promote a thought to a topic
 */
export function usePromoteLeaderThought(aboutIcId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<{ topic: { id: string; title: string; status: string }; thoughtDeleted: boolean }, ApiError, { id: string; labelId?: string }>({
    mutationFn: async ({ id, labelId }) => {
      const response = await apiClient.post<ApiResponse<{ topic: { id: string; title: string; status: string }; thoughtDeleted: boolean }>>(
        `/thoughts/${id}/promote`,
        { labelId }
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Remove the thought from cache since it's now deleted
      queryClient.removeQueries({ queryKey: leaderThoughtKeys.detail(id) });
      // Invalidate thought list
      if (aboutIcId) {
        queryClient.invalidateQueries({
          queryKey: leaderThoughtKeys.list(aboutIcId),
        });
      }
      // Invalidate topics to refresh the list
      queryClient.invalidateQueries({ queryKey: ['leader-topics'] });
    },
  });
}
