import { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { MeetingsIcon, ICON_SIZES } from '@/components/icons';
import { MeetingCard } from '../meetings/MeetingCard';
import { useMyMeetings, type MeetingWithNext, type Meeting } from '../../hooks/useMeetings';

type FilterTab = 'upcoming' | 'past';

interface ICMeetingPanelProps {
  /** Additional class names */
  className?: string;
  /** Whether topics can be dragged onto meetings */
  enableDropZone?: boolean;
  /** Currently dragged topic ID (for highlighting drop zones) */
  draggedTopicId?: string | null;
  /** Callback when a topic is dropped on a meeting */
  onTopicDrop?: (meetingId: string, topicId: string) => void;
  /** Callback when hovering over a meeting during drag */
  onMeetingHover?: (meetingId: string | null) => void;
}

/**
 * ICMeetingPanel Component
 * Shows meetings for the IC (created by their Leader)
 * - Header: "Upcoming 1:1s"
 * - Tabs: Upcoming | Past
 * - Collapsible meetings list within each tab
 * - NO create button (ICs don't create meetings)
 * - Empty state: "No meetings scheduled yet"
 */
export function ICMeetingPanel({
  className = '',
  enableDropZone = false,
  draggedTopicId = null,
  onTopicDrop,
  onMeetingHover,
}: ICMeetingPanelProps) {
  const { data: meetingsData, isLoading, error } = useMyMeetings();

  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragOverMeetingId, setDragOverMeetingId] = useState<string | null>(null);

  // Get meetings from data
  const upcomingMeetings = meetingsData?.upcoming ?? [];
  const pastMeetings = meetingsData?.past ?? [];

  const hasMeetings = upcomingMeetings.length > 0 || pastMeetings.length > 0;

  // Get current meetings based on active tab
  const currentMeetings = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;

  // Counts for tab badges
  const upcomingCount = upcomingMeetings.length;
  const pastCount = pastMeetings.length;

  // Find the next meeting (marked with isNext flag from API)
  const nextMeeting = upcomingMeetings.find((m: MeetingWithNext) => m.isNext);

  const handleTopicDrop = useCallback((meetingId: string, topicId?: string) => {
    const actualTopicId = topicId || draggedTopicId;
    if (actualTopicId && onTopicDrop) {
      onTopicDrop(meetingId, actualTopicId);
    }
    setDragOverMeetingId(null);
  }, [draggedTopicId, onTopicDrop]);

  const handleDragOver = useCallback((meetingId: string) => {
    setDragOverMeetingId(meetingId);
    onMeetingHover?.(meetingId);
  }, [onMeetingHover]);

  const handleDragLeave = useCallback(() => {
    setDragOverMeetingId(null);
  }, []);

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'past', label: 'Past', count: pastCount },
  ];

  if (isLoading) {
    return (
      <div className={`flex flex-col ${className}`}>
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary mb-4 tracking-wide">
          <MeetingsIcon size={ICON_SIZES.sectionHeader} animateOnHover />
          Upcoming 1:1s
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col ${className}`}>
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary mb-4 tracking-wide">
          <MeetingsIcon size={ICON_SIZES.sectionHeader} animateOnHover />
          Upcoming 1:1s
        </h2>
        <div className="text-sm text-red-600 py-4">
          Failed to load meetings
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with title and filter tabs */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary tracking-wide">
          <MeetingsIcon size={ICON_SIZES.sectionHeader} animateOnHover />
          Upcoming 1:1s
        </h2>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-2 py-1 text-xs rounded transition-colors
                ${
                  activeTab === tab.key
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-text-tertiary">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state - no meetings at all */}
      {!hasMeetings && (
        <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-border rounded-lg bg-gray-50/30">
          <MeetingsIcon size={32} className="text-text-tertiary mb-3" />
          <p className="text-sm text-text-secondary text-center mb-1">
            No meetings scheduled yet
          </p>
          <p className="text-xs text-text-tertiary text-center">
            Your leader will schedule your 1:1 meetings
          </p>
        </div>
      )}

      {/* Meeting list */}
      {hasMeetings && (
        <div className="space-y-2 flex-1 overflow-y-auto">
          {/* Collapse toggle */}
          {currentMeetings.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              {currentMeetings.length} {activeTab === 'upcoming' ? 'upcoming' : 'past'} meeting{currentMeetings.length !== 1 ? 's' : ''}
            </button>
          )}

          {/* Meetings */}
          {isExpanded && currentMeetings.length > 0 && (
            <div className="space-y-2">
              {currentMeetings.map((meeting: Meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  variant="ic"
                  showNextBadge={activeTab === 'upcoming' && nextMeeting?.id === meeting.id}
                  isDropZone={activeTab === 'upcoming' && enableDropZone && !!draggedTopicId && meeting.status === 'SCHEDULED'}
                  isDragOver={dragOverMeetingId === meeting.id}
                  onTopicDrop={handleTopicDrop}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                />
              ))}
            </div>
          )}

          {/* Empty state for current tab */}
          {currentMeetings.length === 0 && (
            <p className="text-sm text-text-tertiary py-2">
              {activeTab === 'upcoming'
                ? 'No upcoming meetings scheduled.'
                : 'No past meetings yet.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export type { ICMeetingPanelProps };
