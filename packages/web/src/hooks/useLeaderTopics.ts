import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiError } from '../services/api';
import type { PartialBlock } from '@blocknote/core';
import type { Label } from './useLabels';

// BlockNote content type (array of blocks)
export type EditorContent = PartialBlock[] | null;

// Topic status enum
export type TopicStatus = 'BACKLOG' | 'SCHEDULED' | 'DISCUSSED' | 'ARCHIVED';

// Next meeting info for scheduled topics
export interface NextMeetingInfo {
  id: string;
  scheduledAt: string;
}

// Topic types (extended for leader view)
export interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  label: Label | null;
  createdAt: string;
  updatedAt: string;
  /** True if this is the IC's own topic (counterparty view) */
  isCounterparty: boolean;
  /** User ID of the topic owner */
  userId: string;
  /** IC ID this topic is about (null for IC's own topics) */
  aboutIcId: string | null;
  /** Next scheduled meeting (for SCHEDULED topics) */
  nextMeeting?: NextMeetingInfo | null;
}

export interface TopicDetail extends Topic {
  content: EditorContent;
  meetingTopics: Array<{
    meeting: {
      id: string;
      scheduledAt: string;
      title: string | null;
      status: string;
    };
  }>;
}

export interface CreateTopicInput {
  title: string;
  content?: EditorContent;
  labelId?: string | null;
  aboutIcId: string; // Required for leader topics
}

export interface UpdateTopicInput {
  id: string;
  title?: string;
  content?: EditorContent;
  labelId?: string | null;
}

export interface LeaderTopicFilters {
  status?: TopicStatus;
  labelId?: string;
  /** Include IC's own topics in the response */
  includeCounterparty?: boolean;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Query keys for cache management
export const leaderTopicKeys = {
  all: ['leader-topics'] as const,
  list: (aboutIcId: string, params?: LeaderTopicFilters) =>
    [...leaderTopicKeys.all, 'list', aboutIcId, params] as const,
  detail: (id: string) => [...leaderTopicKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch leader's topics about a specific IC
 * Optionally includes IC's own topics (counterparty view)
 */
export function useLeaderTopics(aboutIcId: string | undefined, params?: LeaderTopicFilters) {
  return useQuery<Topic[], ApiError>({
    queryKey: leaderTopicKeys.list(aboutIcId!, params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set('aboutIcId', aboutIcId!);
      if (params?.status) {
        queryParams.set('status', params.status);
      }
      if (params?.labelId) {
        queryParams.set('labelId', params.labelId);
      }
      if (params?.includeCounterparty) {
        queryParams.set('includeCounterparty', 'true');
      }
      const url = `/topics?${queryParams}`;
      const response = await apiClient.get<ApiResponse<Topic[]>>(url);
      return response.data;
    },
    enabled: !!aboutIcId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single topic with full content
 */
export function useLeaderTopic(id: string | undefined) {
  return useQuery<TopicDetail, ApiError>({
    queryKey: leaderTopicKeys.detail(id!),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TopicDetail>>(`/topics/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a new topic about an IC
 */
export function useCreateLeaderTopic() {
  const queryClient = useQueryClient();

  return useMutation<TopicDetail, ApiError, CreateTopicInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<TopicDetail>>('/topics', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate all topic lists for this IC (regardless of filter params)
      queryClient.invalidateQueries({
        queryKey: [...leaderTopicKeys.all, 'list', variables.aboutIcId],
      });
    },
  });
}

/**
 * Hook to update a topic
 */
export function useUpdateLeaderTopic(aboutIcId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<TopicDetail, ApiError, UpdateTopicInput>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<TopicDetail>>(`/topics/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedTopic) => {
      // Update the detail cache
      queryClient.setQueryData(leaderTopicKeys.detail(updatedTopic.id), updatedTopic);
      // Invalidate all topic lists for this IC (regardless of filter params)
      if (aboutIcId) {
        queryClient.invalidateQueries({
          queryKey: [...leaderTopicKeys.all, 'list', aboutIcId],
        });
      }
    },
  });
}

/**
 * Hook to delete a topic
 */
export function useDeleteLeaderTopic(aboutIcId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      await apiClient.delete(`/topics/${id}`);
    },
    onSuccess: (_, { id }) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: leaderTopicKeys.detail(id) });
      // Invalidate all topic lists for this IC (regardless of filter params)
      if (aboutIcId) {
        queryClient.invalidateQueries({
          queryKey: [...leaderTopicKeys.all, 'list', aboutIcId],
        });
      }
    },
  });
}

/**
 * Hook to archive a topic
 */
export function useArchiveLeaderTopic(aboutIcId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<TopicDetail, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await apiClient.post<ApiResponse<TopicDetail>>(`/topics/${id}/archive`);
      return response.data;
    },
    onSuccess: (updatedTopic) => {
      // Update the detail cache
      queryClient.setQueryData(leaderTopicKeys.detail(updatedTopic.id), updatedTopic);
      // Invalidate list
      if (aboutIcId) {
        queryClient.invalidateQueries({
          queryKey: leaderTopicKeys.list(aboutIcId),
        });
      }
    },
  });
}
