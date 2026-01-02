import { useState, useMemo, useCallback } from 'react';
import { CalendarPlus, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { startOfDay, isBefore } from 'date-fns';
import { MeetingsIcon, ICON_SIZES } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { MeetingCard } from '../meetings/MeetingCard';
import { GenerateMeetingsModal } from './GenerateMeetingsModal';
import { QuickAddMeetingButton } from './QuickAddMeetingButton';
import { useMeetingsByIc, type Meeting } from '../../hooks/useMeetings';
import { useICContext } from '../../contexts/ICContext';

type FilterTab = 'upcoming' | 'past';

interface LeaderMeetingPanelProps {
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
 * LeaderMeetingPanel Component
 * Shows meetings for the currently selected IC
 * - Header with "Upcoming 1:1s" title and "Generate" button
 * - Tabs: Upcoming | Past
 * - Collapsible meetings list within each tab
 * - Empty state with "Generate your first meetings" button
 */
export function LeaderMeetingPanel({
  className = '',
  enableDropZone = false,
  draggedTopicId = null,
  onTopicDrop,
  onMeetingHover,
}: LeaderMeetingPanelProps) {
  const { ic, icId } = useICContext();
  const { data: meetings = [], isLoading, error } = useMeetingsByIc(icId);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragOverMeetingId, setDragOverMeetingId] = useState<string | null>(null);

  // Split meetings into upcoming and past
  const { upcomingMeetings, pastMeetings } = useMemo(() => {
    const today = startOfDay(new Date());

    const upcoming: Meeting[] = [];
    const past: Meeting[] = [];

    meetings.forEach((meeting) => {
      const meetingDate = startOfDay(new Date(meeting.scheduledAt));
      if (isBefore(meetingDate, today)) {
        past.push(meeting);
      } else {
        upcoming.push(meeting);
      }
    });

    // Sort upcoming by date ascending (soonest first)
    upcoming.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    // Sort past by date descending (most recent first)
    past.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    return { upcomingMeetings: upcoming, pastMeetings: past };
  }, [meetings]);

  const hasMeetings = meetings.length > 0;

  // Get current meetings based on active tab
  const currentMeetings = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;

  // Counts for tab badges
  const upcomingCount = upcomingMeetings.length;
  const pastCount = pastMeetings.length;

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
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary mb-4 tracking-wide flex-shrink-0">
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
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary mb-4 tracking-wide flex-shrink-0">
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
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {/* Header with title and filter tabs */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary tracking-wide">
          <MeetingsIcon size={ICON_SIZES.sectionHeader} animateOnHover />
          Upcoming 1:1s
        </h2>

        {/* Generate button and Filter tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            className="text-xs h-7 px-2"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Generate
          </Button>
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
      </div>

      {/* Empty state - no meetings at all */}
      {!hasMeetings && (
        <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-border rounded-lg bg-gray-50/30">
          <MeetingsIcon size={32} className="text-text-tertiary mb-3" />
          <p className="text-sm text-text-tertiary text-center mb-4">
            No meetings scheduled
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
          >
            <CalendarPlus className="w-4 h-4" />
            Generate your first meetings
          </Button>
        </div>
      )}

      {/* Meeting list - scrollable */}
      {hasMeetings && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
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
              {currentMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  icId={icId}
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

          {/* Quick add button - only in upcoming tab */}
          {activeTab === 'upcoming' && (
            <div className="pt-1">
              <QuickAddMeetingButton icId={icId!} />
            </div>
          )}
        </div>
      )}

      {/* Generate meetings modal */}
      {icId && ic && (
        <GenerateMeetingsModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          icId={icId}
          icName={ic.name}
        />
      )}
    </div>
  );
}

export type { LeaderMeetingPanelProps };
