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

// Topic types
export interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  label: Label | null;
  createdAt: string;
  updatedAt: string;
  /** Next scheduled meeting (for SCHEDULED topics) */
  nextMeeting?: NextMeetingInfo | null;
}

export interface MeetingInfo {
  id: string;
  scheduledAt: string;
  title: string | null;
  status: string;
}

export interface MeetingTopicInfo {
  meeting: MeetingInfo;
}

export interface TopicDetail extends Topic {
  content: EditorContent;
  meetingTopics: MeetingTopicInfo[];
}

export interface CreateTopicInput {
  title: string;
  content?: EditorContent;
  labelId?: string | null;
}

export interface UpdateTopicInput {
  id: string;
  title?: string;
  content?: EditorContent;
  labelId?: string | null;
}

export interface TopicFilters {
  status?: TopicStatus;
  labelId?: string;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Query keys for cache management
export const topicKeys = {
  all: ['topics'] as const,
  list: (params?: TopicFilters) => [...topicKeys.all, 'list', params] as const,
  detail: (id: string) => [...topicKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all topics (list view - titles only)
 */
export function useTopics(params?: TopicFilters) {
  return useQuery<Topic[], ApiError>({
    queryKey: topicKeys.list(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.status) {
        queryParams.set('status', params.status);
      }
      if (params?.labelId) {
        queryParams.set('labelId', params.labelId);
      }
      const url = `/topics${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get<ApiResponse<Topic[]>>(url);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single topic with full content
 */
export function useTopic(id: string | undefined) {
  return useQuery<TopicDetail, ApiError>({
    queryKey: topicKeys.detail(id!),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TopicDetail>>(`/topics/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to create a new topic
 */
export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation<TopicDetail, ApiError, CreateTopicInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<TopicDetail>>('/topics', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all topic list queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/**
 * Hook to update a topic
 */
export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation<TopicDetail, ApiError, UpdateTopicInput>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<TopicDetail>>(`/topics/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedTopic) => {
      // Update the detail cache
      queryClient.setQueryData(topicKeys.detail(updatedTopic.id), updatedTopic);

      // Invalidate all topic list queries to refresh with new data
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/**
 * Hook to delete a topic
 */
export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      await apiClient.delete(`/topics/${id}`);
    },
    onSuccess: (_, { id }) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: topicKeys.detail(id) });
      // Invalidate all topic list queries
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/**
 * Hook to schedule a topic on a meeting
 */
export function useScheduleTopic() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, { topicId: string; meetingId: string }>({
    mutationFn: async ({ topicId, meetingId }) => {
      const response = await apiClient.post<ApiResponse<unknown>>(
        `/meetings/${meetingId}/topics`,
        { topicId }
      );
      return response.data;
    },
    onSuccess: (_, { topicId }) => {
      // Invalidate topic detail to refresh meeting associations
      queryClient.invalidateQueries({ queryKey: topicKeys.detail(topicId) });
      // Invalidate all topic list queries (status may have changed)
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
      // Invalidate meetings list
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

/**
 * Hook to archive a topic
 */
export function useArchiveTopic() {
  const queryClient = useQueryClient();

  return useMutation<TopicDetail, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await apiClient.post<ApiResponse<TopicDetail>>(`/topics/${id}/archive`);
      return response.data;
    },
    onSuccess: (updatedTopic) => {
      // Update the detail cache
      queryClient.setQueryData(topicKeys.detail(updatedTopic.id), updatedTopic);
      // Invalidate all topic list queries
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

/**
 * Helper hook to get a topic by ID from the list cache
 */
export function useTopicById(id: string | null | undefined) {
  const { data: topics } = useTopics();
  return topics?.find((topic) => topic.id === id) ?? null;
}
