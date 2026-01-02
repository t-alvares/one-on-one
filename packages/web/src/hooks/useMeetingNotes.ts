import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiError } from '../services/api';

// Meeting notes type from API
export interface MeetingNotes {
  id: string | null;
  content: Record<string, unknown>;
  lastEditedBy: { id: string; name: string } | null;
  lastEditedAt: string | null;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Query keys for cache management
export const meetingNotesKeys = {
  all: ['meeting-notes'] as const,
  detail: (meetingId: string) => [...meetingNotesKeys.all, meetingId] as const,
};

/**
 * Hook to fetch meeting notes
 */
export function useMeetingNotes(meetingId: string | undefined) {
  return useQuery<MeetingNotes, ApiError>({
    queryKey: meetingNotesKeys.detail(meetingId!),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MeetingNotes>>(
        `/meetings/${meetingId}/notes`
      );
      return response.data;
    },
    enabled: !!meetingId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to update meeting notes (auto-save)
 */
export function useUpdateMeetingNotes(meetingId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<MeetingNotes, ApiError, { content: Record<string, unknown> }>({
    mutationFn: async (data) => {
      const response = await apiClient.put<ApiResponse<MeetingNotes>>(
        `/meetings/${meetingId}/notes`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedNotes) => {
      // Update the cache with the new notes
      if (meetingId) {
        queryClient.setQueryData(meetingNotesKeys.detail(meetingId), updatedNotes);
      }
    },
  });
}
