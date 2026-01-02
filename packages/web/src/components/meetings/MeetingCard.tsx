import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MoreHorizontal, Loader2 } from 'lucide-react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import type { Meeting } from '../../hooks/useMeetings';
import { useDeleteMeeting, useUpdateMeeting } from '../../hooks/useMeetings';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { DeleteIcon } from '@/components/icons';

interface MeetingCardProps {
  meeting: Meeting;
  /** IC ID for cache invalidation */
  icId?: string;
  /** Display variant: 'leader' shows IC name, 'ic' shows Leader name */
  variant?: 'leader' | 'ic';
  /** Show "Next" badge (for IC's next meeting) */
  showNextBadge?: boolean;
  /** Whether this card is a drop zone for topics */
  isDropZone?: boolean;
  /** Whether a topic is currently being dragged over this card */
  isDragOver?: boolean;
  /** Callback when drop zone accepts a topic */
  onTopicDrop?: (meetingId: string, topicId?: string) => void;
  /** Callback when drag enters this card */
  onDragEnter?: (meetingId: string) => void;
  /** Callback when drag leaves this card */
  onDragLeave?: () => void;
}

/**
 * MeetingCard Component
 * Displays a single meeting with status-based styling
 * - Today: Orange left border + "Today" badge
 * - Upcoming: Blue left border
 * - Completed: Green left border + checkmark
 * - Past (not completed): Grey, muted
 */
export function MeetingCard({
  meeting,
  icId,
  variant = 'leader',
  showNextBadge = false,
  isDropZone = false,
  isDragOver = false,
  onTopicDrop,
  onDragEnter,
  onDragLeave,
}: MeetingCardProps) {
  const navigate = useNavigate();
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const deleteMeeting = useDeleteMeeting();
  const updateMeeting = useUpdateMeeting();

  const scheduledDate = new Date(meeting.scheduledAt);
  const today = startOfDay(new Date());
  const meetingDay = startOfDay(scheduledDate);
  const isScheduledToday = isToday(scheduledDate);
  const isPast = isBefore(meetingDay, today);
  const isCompleted = meeting.status === 'COMPLETED';
  const isCancelled = meeting.status === 'CANCELLED';

  // Get topic counts by party
  const icTopicCount = meeting.topicCounts?.ic ?? 0;
  const leaderTopicCount = meeting.topicCounts?.leader ?? 0;
  const icName = meeting.relationship?.ic?.name?.split(' ')[0] || 'IC';
  const leaderName = meeting.relationship?.leader?.name?.split(' ')[0] || 'Leader';

  // Determine border color based on status
  const getBorderClass = () => {
    if (isCompleted) return 'border-l-success';
    if (isCancelled) return 'border-l-text-tertiary';
    if (isScheduledToday) return 'border-l-orange-500';
    if (isPast) return 'border-l-text-tertiary';
    return 'border-l-gray-400';
  };

  const handleClick = () => {
    navigate(`/meetings/${meeting.id}`);
  };

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsMenu(!showActionsMenu);
  };

  const handleReschedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsMenu(false);
    // Pre-fill with current date/time
    setRescheduleDate(format(scheduledDate, 'yyyy-MM-dd'));
    setRescheduleTime(format(scheduledDate, 'HH:mm'));
    setShowRescheduleModal(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsMenu(false);
    setShowDeleteModal(true);
  };

  const confirmReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) return;

    const newScheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
    await updateMeeting.mutateAsync({
      id: meeting.id,
      scheduledAt: newScheduledAt,
    });
    setShowRescheduleModal(false);
  };

  const confirmDelete = async () => {
    await deleteMeeting.mutateAsync({ id: meeting.id, icId });
    setShowDeleteModal(false);
  };

  // Helper to check if dataTransfer contains topic data
  // Using Array.from for browser compatibility (DOMStringList.includes may not exist)
  const hasTopicData = (dataTransfer: DataTransfer): boolean => {
    return Array.from(dataTransfer.types).includes('application/topic');
  };

  // Handle drag events for drop zone visual feedback
  // Note: Actual drop is handled via dragEnd workaround in WorkspacePage
  const handleDragOver = (e: React.DragEvent) => {
    if (!onTopicDrop || meeting.status !== 'SCHEDULED') return;
    if (hasTopicData(e.dataTransfer)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (!onDragEnter || meeting.status !== 'SCHEDULED') return;
    if (hasTopicData(e.dataTransfer)) {
      e.preventDefault();
      onDragEnter(meeting.id);
    }
  };

  const handleDragLeaveEvent = (e: React.DragEvent) => {
    if (!onDragLeave || meeting.status !== 'SCHEDULED') return;
    // Only trigger if leaving the card entirely (not just moving between children)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      onDragLeave();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!onTopicDrop || meeting.status !== 'SCHEDULED') return;
    if (!hasTopicData(e.dataTransfer)) return;

    e.preventDefault();
    e.stopPropagation();

    // Get topic data directly from the drop event
    const topicData = e.dataTransfer.getData('application/topic');
    if (topicData) {
      try {
        const topic = JSON.parse(topicData);
        onTopicDrop(meeting.id, topic.id);
      } catch {
        onTopicDrop(meeting.id);
      }
    } else {
      onTopicDrop(meeting.id);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeaveEvent}
        onDrop={handleDrop}
        className={`
          group relative p-3 rounded-lg border border-l-4 cursor-pointer
          transition-all duration-200
          ${getBorderClass()}
          ${isPast && !isCompleted ? 'opacity-60 bg-gray-50/50' : 'bg-white hover:bg-gray-50/50'}
          ${isDragOver ? 'ring-2 ring-wawanesa-blue ring-offset-1 bg-wawanesa-blue/5' : ''}
          hover:shadow-sm
        `}
      >
        {/* Row 1: Date, Time, badges | Topic counts + Actions */}
        <div className="flex items-center justify-between gap-3 mb-1">
          {/* Left: Date, Time, and badges */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">
              {format(scheduledDate, 'EEE, MMM d')}
            </span>
            <span className="text-xs text-text-tertiary">
              {format(scheduledDate, 'h:mm a')}
            </span>
            {showNextBadge && !isCompleted && !isCancelled && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-wawanesa-blue/10 text-wawanesa-blue rounded">
                Next
              </span>
            )}
            {isScheduledToday && !isCompleted && !isCancelled && !showNextBadge && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                Today
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                <Check className="w-3 h-3" />
                Done
              </span>
            )}
          </div>

          {/* Right: Topic counts + Actions */}
          <div className="flex items-center gap-2">
            {/* Topic counts - compact inline */}
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <span>
                {icName}: {icTopicCount > 0 ? (
                  <span className="font-medium text-text-secondary">{icTopicCount}</span>
                ) : (
                  <span className="text-text-tertiary/50">0</span>
                )}
              </span>
              <span>
                {leaderName}: {leaderTopicCount > 0 ? (
                  <span className="font-medium text-text-secondary">{leaderTopicCount}</span>
                ) : (
                  <span className="text-text-tertiary/50">0</span>
                )}
              </span>
            </div>

            {/* Actions menu - only for SCHEDULED meetings AND leader variant */}
            {meeting.status === 'SCHEDULED' && variant === 'leader' && (
              <div className="relative">
                <button
                  onClick={handleActionsClick}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  aria-label="Meeting actions"
                >
                  <MoreHorizontal className="w-4 h-4 text-text-tertiary" />
                </button>

                {showActionsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowActionsMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border/50 rounded shadow-sm py-1 min-w-[120px]">
                      <button
                        onClick={handleReschedule}
                        className="w-full px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-gray-50 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-full px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Title - shows "1:1 with [Name]" */}
        <p className="text-sm text-text-secondary truncate">
          {variant === 'ic'
            ? `1:1 with ${meeting.relationship?.leader?.name || ''}`.trim() || meeting.title || '1:1 Meeting'
            : meeting.title || '1:1 Meeting'}
        </p>

        {/* Drop zone indicator */}
        {isDropZone && isDragOver && (
          <div className="absolute inset-0 rounded-lg border-2 border-dashed border-wawanesa-blue bg-wawanesa-blue/5 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-wawanesa-blue">
              Drop to schedule
            </span>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Cancel Meeting"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-2 -mt-2">
          Are you sure you want to cancel this meeting?
        </p>
        <p className="text-sm text-text-tertiary mb-6">
          {format(scheduledDate, 'EEEE, MMMM d')} at {format(scheduledDate, 'h:mm a')}
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(false)}
          >
            Keep Meeting
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={confirmDelete}
            disabled={deleteMeeting.isPending}
          >
            {deleteMeeting.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <DeleteIcon size={16} />
                Cancel Meeting
              </>
            )}
          </Button>
        </div>
      </Modal>

      {/* Reschedule modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Meeting"
        size="sm"
      >
        <div className="space-y-4 -mt-2">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Date
            </label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/20 focus:border-wawanesa-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Time
            </label>
            <input
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/20 focus:border-wawanesa-blue"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRescheduleModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={confirmReschedule}
            disabled={updateMeeting.isPending || !rescheduleDate || !rescheduleTime}
          >
            {updateMeeting.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export type { MeetingCardProps };
