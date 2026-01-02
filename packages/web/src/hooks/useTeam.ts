import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Team member type
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  position: string | null;
  positionType: string | null;
  teamDisplayOrder: number | null;
  relationshipId: string;
  upcomingMeetingCount: number;
  pendingActionCount: number;
}

// Position type column
export interface PositionType {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
  members: TeamMember[];
}

// Team board structure
export interface TeamBoard {
  positionTypes: PositionType[];
  unassigned: TeamMember[];
}

// IC detail type
export interface ICDetail {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  position: string | null;
  positionType: string | null;
  teamDisplayOrder: number | null;
  yearsOfService: number | null;
  timeInPosition: number | null;
  createdAt: string;
  relationshipId: string;
  upcomingMeetings: Array<{
    id: string;
    scheduledAt: string;
    title: string | null;
    status: string;
  }>;
  recentMeetings: Array<{
    id: string;
    scheduledAt: string;
    title: string | null;
    status: string;
  }>;
  pendingActions: number;
  completedActions: number;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Query keys for cache management
export const teamKeys = {
  all: ['team'] as const,
  board: () => [...teamKeys.all, 'board'] as const,
  icDetail: (id: string) => [...teamKeys.all, 'ic', id] as const,
  columns: () => [...teamKeys.all, 'columns'] as const,
};

/**
 * Hook to fetch team board (grouped by position type)
 * Only enabled for Leader/Admin users
 */
export function useTeamBoard() {
  const { user } = useAuth();
  const isLeaderOrAdmin = user?.role === 'LEADER' || user?.role === 'ADMIN';

  return useQuery<TeamBoard, ApiError>({
    queryKey: teamKeys.board(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TeamBoard>>('/team');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: isLeaderOrAdmin, // Only fetch for Leaders/Admins
  });
}

/**
 * Hook to fetch all team members as a flat list (for sidebar)
 */
export function useTeamMembers() {
  const { data: board, ...rest } = useTeamBoard();

  // Flatten all members from all columns + unassigned
  const members: TeamMember[] = [];
  if (board) {
    for (const pt of board.positionTypes) {
      members.push(...pt.members);
    }
    members.push(...board.unassigned);
    // Sort alphabetically by name
    members.sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    ...rest,
    data: members,
  };
}

/**
 * Hook to fetch IC details
 */
export function useICDetail(icId: string | undefined) {
  return useQuery<ICDetail, ApiError>({
    queryKey: teamKeys.icDetail(icId!),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ICDetail>>(`/team/${icId}`);
      return response.data;
    },
    enabled: !!icId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to reorder an IC (move between columns or within column)
 */
export function useReorderIC() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { icId: string; positionType: string | null; displayOrder: number }>({
    mutationFn: async ({ icId, positionType, displayOrder }) => {
      await apiClient.put('/team/reorder', { icId, positionType, displayOrder });
    },
    onSuccess: () => {
      // Invalidate team board to refresh
      queryClient.invalidateQueries({ queryKey: teamKeys.board() });
    },
  });
}

/**
 * Hook to reorder columns
 */
export function useReorderColumns() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { columnOrder: string[] }>({
    mutationFn: async ({ columnOrder }) => {
      await apiClient.put('/team/columns/reorder', { columnOrder });
    },
    onSuccess: () => {
      // Invalidate team board to refresh
      queryClient.invalidateQueries({ queryKey: teamKeys.board() });
    },
  });
}

/**
 * Hook to create a new column
 */
export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; name: string; code: string; displayOrder: number },
    ApiError,
    { name: string; code: string }
  >({
    mutationFn: async ({ name, code }) => {
      const response = await apiClient.post<
        ApiResponse<{ id: string; name: string; code: string; displayOrder: number }>
      >('/team/columns', { name, code });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate team board to refresh
      queryClient.invalidateQueries({ queryKey: teamKeys.board() });
    },
  });
}

/**
 * Hook to delete a column
 */
export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { code: string }>({
    mutationFn: async ({ code }) => {
      await apiClient.delete(`/team/columns/${code}`);
    },
    onSuccess: () => {
      // Invalidate team board to refresh
      queryClient.invalidateQueries({ queryKey: teamKeys.board() });
    },
  });
}
