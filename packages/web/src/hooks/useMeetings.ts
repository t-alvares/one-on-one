import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiError } from '../services/api';
import { leaderTopicKeys } from './useLeaderTopics';

// Meeting status enum
export type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

// Meeting type for list view
export interface Meeting {
  id: string;
  scheduledAt: string;
  title: string | null;
  status: MeetingStatus;
  relationship: {
    id: string;
    ic: {
      id: string;
      name: string;
    };
    leader: {
      id: string;
      name: string;
    };
  };
  topicCount?: number;
  topicCounts?: {
    ic: number;
    leader: number;
  };
}

// Meeting detail with topics
export interface MeetingTopic {
  id: string;
  meetingTopicId: string;
  title: string;
  label: { id: string; name: string; color: string } | null;
  addedBy: {
    id: string;
    name: string;
    isCurrentUser: boolean;
  };
  resolution: string | null;
  order: number;
}

export interface MeetingDetail extends Meeting {
  topics: MeetingTopic[];
  notes: Array<{
    id: string;
    content: string;
    author: { id: string; name: string };
    createdAt: string;
  }>;
}

export interface MeetingFilters {
  icId?: string;
  relationshipId?: string;
  status?: MeetingStatus;
  upcoming?: boolean;
}

// Input types for mutations
export interface CreateMeetingInput {
  icId: string;
  scheduledAt: string;
  title?: string;
}

export interface GenerateMeetingsInput {
  icId: string;
  frequency: 'WEEKLY' | 'BIWEEKLY';
  dayOfWeek: number; // 0-6, Sunday = 0
  time: string; // HH:mm format
  count: number;
}

export interface UpdateMeetingInput {
  id: string;
  scheduledAt?: string;
  title?: string;
}

export interface AddTopicToMeetingInput {
  meetingId: string;
  topicId: string;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Query keys for cache management
export const meetingKeys = {
  all: ['meetings'] as const,
  list: (params?: MeetingFilters) => [...meetingKeys.all, 'list', params] as const,
  listByIc: (icId: string) => [...meetingKeys.all, 'listByIc', icId] as const,
  myMeetings: () => [...meetingKeys.all, 'my'] as const,
  detail: (id: string) => [...meetingKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch meetings
 */
export function useMeetings(params?: MeetingFilters) {
  return useQuery<Meeting[], ApiError>({
    queryKey: meetingKeys.list(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.icId) {
        queryParams.set('icId', params.icId);
      }
      if (params?.relationshipId) {
        queryParams.set('relationshipId', params.relationshipId);
      }
      if (params?.status) {
        queryParams.set('status', params.status);
      }
      if (params?.upcoming !== undefined) {
        queryParams.set('upcoming', String(params.upcoming));
      }
      const url = `/meetings${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get<ApiResponse<Meeting[]>>(url);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// API response type for meetings by IC
interface MeetingsByIcResponse {
  upcoming: Meeting[];
  past: Meeting[];
}

/**
 * Hook to fetch meetings for a specific IC
 * The API returns { upcoming: [], past: [] } which we flatten to a single array
 */
export function useMeetingsByIc(icId: string | undefined) {
  return useQuery<Meeting[], ApiError>({
    queryKey: meetingKeys.listByIc(icId!),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MeetingsByIcResponse>>(`/meetings?icId=${icId}`);
      const { upcoming = [], past = [] } = response.data || {};
      return [...upcoming, ...past];
    },
    enabled: !!icId,
    staleTime: 30 * 1000,
  });
}

// Extended meeting type with isNext flag from API
export interface MeetingWithNext extends Meeting {
  isNext?: boolean;
}

// API response type for my meetings (IC view)
interface MyMeetingsResponse {
  upcoming: MeetingWithNext[];
  past: Meeting[];
}

/**
 * Hook for IC users to fetch their own meetings
 * Returns meetings split into upcoming (with isNext flag) and past
 */
export function useMyMeetings() {
  return useQuery<MyMeetingsResponse, ApiError>({
    queryKey: meetingKeys.myMeetings(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MyMeetingsResponse>>('/meetings');
      return response.data || { upcoming: [], past: [] };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single meeting with full details
 */
export function useMeeting(id: string | undefined) {
  return useQuery<MeetingDetail, ApiError>({
    queryKey: meetingKeys.detail(id!),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MeetingDetail>>(`/meetings/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch upcoming meetings only (for IC users)
 * Handles the API response format which returns { upcoming: [], past: [] }
 */
export function useUpcomingMeetings() {
  return useQuery<Meeting[], ApiError>({
    queryKey: meetingKeys.list({ upcoming: true, status: 'SCHEDULED' }),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MeetingsByIcResponse>>(
        '/meetings?upcoming=true&status=SCHEDULED'
      );
      // API returns { upcoming, past } - extract just the upcoming meetings
      const { upcoming = [] } = response.data || {};
      return upcoming;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a single meeting
 */
export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation<Meeting, ApiError, CreateMeetingInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<Meeting>>('/meetings', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate all meeting queries
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      // Specifically invalidate the IC's meetings
      queryClient.invalidateQueries({ queryKey: meetingKeys.listByIc(variables.icId) });
    },
  });
}

/**
 * Hook to generate recurring meetings
 */
export function useGenerateMeetings() {
  const queryClient = useQueryClient();

  return useMutation<Meeting[], ApiError, GenerateMeetingsInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<Meeting[]>>('/meetings/generate', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate all meeting queries
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      // Specifically invalidate the IC's meetings
      queryClient.invalidateQueries({ queryKey: meetingKeys.listByIc(variables.icId) });
    },
  });
}

/**
 * Hook to update a meeting (reschedule, rename)
 */
export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation<Meeting, ApiError, UpdateMeetingInput>({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<Meeting>>(`/meetings/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedMeeting) => {
      // Update the detail cache
      queryClient.setQueryData(meetingKeys.detail(updatedMeeting.id), updatedMeeting);
      // Invalidate all meeting list queries
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
    },
  });
}

/**
 * Hook to delete a meeting
 */
export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string; icId?: string }>({
    mutationFn: async ({ id }) => {
      await apiClient.delete(`/meetings/${id}`);
    },
    onSuccess: (_, { id, icId }) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: meetingKeys.detail(id) });
      // Invalidate all meeting list queries
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      // Specifically invalidate the IC's meetings if provided
      if (icId) {
        queryClient.invalidateQueries({ queryKey: meetingKeys.listByIc(icId) });
      }
    },
  });
}

/**
 * Hook to add a topic to a meeting (schedule topic)
 */
export function useAddTopicToMeeting() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, AddTopicToMeetingInput & { icId?: string }>({
    mutationFn: async ({ meetingId, topicId }) => {
      const response = await apiClient.post<ApiResponse<unknown>>(
        `/meetings/${meetingId}/topics`,
        { topicId }
      );
      return response.data;
    },
    onSuccess: (_, { meetingId, icId }) => {
      // Invalidate meeting detail
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
      // Invalidate all meeting list queries (topic count changed)
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      // Invalidate topic lists (status changed to SCHEDULED)
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      if (icId) {
        // Invalidate ALL leader topic queries for this IC (regardless of filter params)
        // Using prefix match: ['leader-topics', 'list', icId] matches all param variations
        queryClient.invalidateQueries({ queryKey: [...leaderTopicKeys.all, 'list', icId] });
      }
    },
  });
}

/**
 * Hook to remove a topic from a meeting (unschedule topic)
 */
export function useRemoveTopicFromMeeting() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { meetingId: string; topicId: string; icId?: string }>({
    mutationFn: async ({ meetingId, topicId }) => {
      await apiClient.delete(`/meetings/${meetingId}/topics/${topicId}`);
    },
    onSuccess: (_, { meetingId, icId }) => {
      // Invalidate meeting detail
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
      // Invalidate all meeting list queries
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      // Invalidate topic lists (status may change back to BACKLOG)
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      if (icId) {
        // Invalidate ALL leader topic queries for this IC (regardless of filter params)
        queryClient.invalidateQueries({ queryKey: [...leaderTopicKeys.all, 'list', icId] });
      }
    },
  });
}

/**
 * Hook to complete a meeting
 */
export function useCompleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; status: MeetingStatus; unresolvedTopics: number }, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await apiClient.post<ApiResponse<{ id: string; status: MeetingStatus; unresolvedTopics: number }>>(
        `/meetings/${id}/complete`
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Invalidate meeting detail
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      // Invalidate all meeting list queries
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      // Invalidate topic lists (statuses may have changed)
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
}
