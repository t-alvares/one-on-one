import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Loader2, AlertCircle, Check } from 'lucide-react';
import { useUpcomingMeetings, type Meeting } from '../../hooks/useMeetings';
import { useScheduleTopic } from '../../hooks/useTopics';
import { Button } from '../ui/button';

interface MeetingPickerProps {
  /** Topic ID to schedule */
  topicId: string;
  /** Callback when scheduling is successful */
  onScheduled?: (meetingId: string) => void;
  /** Additional class names */
  className?: string;
}

/**
 * MeetingPicker Component
 * Dropdown to select an upcoming meeting for scheduling a topic
 * - Fetches upcoming meetings
 * - Allows selection and confirmation
 * - Shows loading/error states
 */
export function MeetingPicker({ topicId, onScheduled, className = '' }: MeetingPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: meetings = [], isLoading, error } = useUpcomingMeetings();
  const scheduleTopic = useScheduleTopic();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  const handleConfirm = async () => {
    if (!selectedMeeting) return;

    try {
      await scheduleTopic.mutateAsync({
        topicId,
        meetingId: selectedMeeting.id,
      });
      setIsOpen(false);
      setSelectedMeeting(null);
      onScheduled?.(selectedMeeting.id);
    } catch (error) {
      console.error('Failed to schedule topic:', error);
    }
  };

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMeetingTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={scheduleTopic.isPending}
      >
        {scheduleTopic.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scheduling...
          </>
        ) : (
          <>
            <Calendar className="w-4 h-4" />
            Add to 1:1
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-border rounded-lg shadow-lg min-w-[280px]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-text-primary">
              Select a meeting
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Choose an upcoming 1:1 to add this topic to
            </p>
          </div>

          {/* Content */}
          <div className="max-h-[240px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-text-tertiary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading meetings...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-tertiary">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Failed to load meetings</span>
              </div>
            ) : meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-tertiary">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">No upcoming meetings</span>
                <span className="text-xs">Ask your leader to schedule a 1:1</span>
              </div>
            ) : (
              <div className="py-2">
                {meetings.map((meeting) => {
                  const isSelected = selectedMeeting?.id === meeting.id;
                  return (
                    <button
                      key={meeting.id}
                      type="button"
                      onClick={() => handleSelectMeeting(meeting)}
                      className={`
                        w-full px-4 py-2.5 text-left
                        flex items-center gap-3
                        hover:bg-surface-secondary
                        transition-colors
                        ${isSelected ? 'bg-surface-secondary' : ''}
                      `}
                    >
                      {/* Selection indicator */}
                      <div className={`
                        w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'border-wawanesa-blue bg-wawanesa-blue' : 'border-border'}
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {/* Meeting info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">
                            {formatMeetingDate(meeting.scheduledAt)}
                          </span>
                          <span className="text-xs text-text-tertiary">
                            {formatMeetingTime(meeting.scheduledAt)}
                          </span>
                        </div>
                        {meeting.title && (
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {meeting.title}
                          </p>
                        )}
                        <p className="text-xs text-text-tertiary mt-0.5">
                          with {meeting.relationship.leader.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with confirm button */}
          {meetings.length > 0 && (
            <div className="px-4 py-3 border-t border-border bg-surface-secondary/50">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedMeeting || scheduleTopic.isPending}
                className="
                  w-full px-3 py-2
                  text-sm font-medium
                  bg-wawanesa-blue text-white
                  rounded-md
                  hover:bg-wawanesa-blue-hover
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {scheduleTopic.isPending ? 'Scheduling...' : 'Confirm'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { MeetingPickerProps };
