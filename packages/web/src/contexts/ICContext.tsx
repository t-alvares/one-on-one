import { createContext, useContext, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useICDetail, type ICDetail } from '../hooks/useTeam';

interface ICContextType {
  /** Currently viewed IC details */
  ic: ICDetail | null;
  /** IC ID from URL params */
  icId: string | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

const ICContext = createContext<ICContextType | undefined>(undefined);

interface ICProviderProps {
  children: ReactNode;
}

/**
 * ICProvider - Provides context for the currently viewed IC in Leader workspace
 *
 * Wraps Leader IC workspace pages and provides:
 * - IC details fetched from API
 * - Loading and error states
 * - IC ID from URL params
 */
export function ICProvider({ children }: ICProviderProps) {
  const { icId } = useParams<{ icId: string }>();
  const { data: ic, isLoading, error } = useICDetail(icId);

  const value: ICContextType = {
    ic: ic ?? null,
    icId,
    isLoading,
    error: error as Error | null,
  };

  return <ICContext.Provider value={value}>{children}</ICContext.Provider>;
}

/**
 * Hook to access IC context
 * Must be used within ICProvider
 */
export function useICContext(): ICContextType {
  const context = useContext(ICContext);
  if (context === undefined) {
    throw new Error('useICContext must be used within an ICProvider');
  }
  return context;
}
