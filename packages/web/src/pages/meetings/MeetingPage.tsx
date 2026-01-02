import { useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { BackIcon, MeetingsIcon, ICON_SIZES } from '@/components/icons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { MeetingAgenda, MeetingNotes } from '@/components/meetings';
import { useMeeting, useUpdateMeeting, useCompleteMeeting } from '../../hooks/useMeetings';
import { useAuth } from '../../contexts/AuthContext';
import type { MeetingStatus } from '../../hooks/useMeetings';

/**
 * MeetingPage Component
 * Full page view for a meeting with agenda and notes
 * Accessible by both Leader and IC
 */
export function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: meeting, isLoading, error } = useMeeting(id);
  const updateMeeting = useUpdateMeeting();
  const completeMeeting = useCompleteMeeting();

  // Local state
  const [title, setTitle] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Determine user's role in this meeting
  const isLeader = useMemo(() => {
    if (!meeting || !user) return false;
    return meeting.relationship.leader.id === user.id;
  }, [meeting, user]);

  // Get the other person's name
  const otherPersonName = useMemo(() => {
    if (!meeting) return '';
    return isLeader ? meeting.relationship.ic.name : meeting.relationship.leader.name;
  }, [meeting, isLeader]);

  // Back link destination
  const backLink = useMemo(() => {
    if (!meeting) return '/';
    return isLeader ? `/team/${meeting.relationship.ic.id}` : '/workspace';
  }, [meeting, isLeader]);

  // Initialize title from meeting
  useMemo(() => {
    if (meeting && title === '') {
      setTitle(meeting.title || `1:1 with ${otherPersonName}`);
    }
  }, [meeting, title, otherPersonName]);

  // Format date and time
  const formattedDate = useMemo(() => {
    if (!meeting) return { date: '', time: '' };
    const date = new Date(meeting.scheduledAt);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  }, [meeting]);

  // Status badge config
  const statusConfig: Record<
    MeetingStatus,
    { variant: 'primary' | 'warning' | 'success' | 'default'; label: string }
  > = {
    SCHEDULED: { variant: 'primary', label: 'Scheduled' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'default', label: 'Cancelled' },
  };

  // Is meeting read-only?
  const isReadOnly = meeting?.status === 'COMPLETED' || meeting?.status === 'CANCELLED';

  // Handle title update
  const handleTitleBlur = useCallback(() => {
    if (!id || !meeting) return;
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== meeting.title) {
      updateMeeting.mutate({ id, title: trimmedTitle });
    }
  }, [id, title, meeting, updateMeeting]);

  // Handle complete meeting
  const handleCompleteMeeting = useCallback(async () => {
    if (!id) return;
    try {
      await completeMeeting.mutateAsync({ id });
      setShowCompleteModal(false);
    } catch (error) {
      console.error('Failed to complete meeting:', error);
    }
  }, [id, completeMeeting]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-wawanesa-blue mb-3" />
        <p className="text-sm text-text-tertiary">Loading meeting...</p>
      </div>
    );
  }

  // Error state
  if (error || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="p-3 rounded-full bg-error-light mb-3">
          <AlertCircle className="w-6 h-6 text-error" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">
          {error ? 'Failed to load meeting' : 'Meeting not found'}
        </p>
        <p className="text-xs text-text-tertiary mb-4">
          {error?.message || 'This meeting may have been deleted'}
        </p>
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-sm text-text-secondary font-medium hover:text-text-primary transition-colors"
        >
          <BackIcon size={16} animateOnHover />
          Go back
        </Link>
      </div>
    );
  }

  // Cancelled meeting state
  if (meeting.status === 'CANCELLED') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="p-3 rounded-full bg-surface-secondary mb-3">
          <AlertCircle className="w-6 h-6 text-text-tertiary" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">
          This meeting was cancelled
        </p>
        <p className="text-xs text-text-tertiary mb-4">
          {formattedDate.date} at {formattedDate.time}
        </p>
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-sm text-text-secondary font-medium hover:text-text-primary transition-colors"
        >
          <BackIcon size={16} animateOnHover />
          Go back
        </Link>
      </div>
    );
  }

  const status = statusConfig[meeting.status] || statusConfig.SCHEDULED;

  return (
    <div className="h-full flex flex-col w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-shrink-0">
        <div className="flex-1">
          {/* Back link */}
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-3"
          >
            <BackIcon size={16} animateOnHover />
            {isLeader ? `Back to ${meeting.relationship.ic.name}` : 'Back to Workspace'}
          </Link>

          {/* Meeting icon and date */}
          <div className="flex items-center gap-3 mb-2">
            <MeetingsIcon size={ICON_SIZES.sectionHeader} />
            <div>
              <p className="text-lg font-medium text-text-primary">{formattedDate.date}</p>
              <p className="text-sm text-text-tertiary">{formattedDate.time}</p>
            </div>
          </div>

          {/* Title row */}
          <div className="flex items-center gap-3 ml-9">
            {isLeader && !isReadOnly ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Meeting title..."
                className="flex-1 max-w-md text-base text-text-secondary bg-transparent border-none placeholder:text-text-tertiary focus:outline-none focus:ring-0"
              />
            ) : (
              <p className="text-base text-text-secondary">
                {meeting.title || `1:1 with ${otherPersonName}`}
              </p>
            )}

            {/* Status badge */}
            <Badge variant={status.variant} dot>
              {status.label}
            </Badge>

            {/* Saving indicator */}
            {updateMeeting.isPending && (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving
              </span>
            )}
          </div>
        </div>

        {/* Complete meeting button - Leader only, scheduled meetings */}
        {isLeader && meeting.status === 'SCHEDULED' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCompleteModal(true)}
            className="mt-8"
          >
            <Check className="w-4 h-4" />
            Complete Meeting
          </Button>
        )}
      </div>

      {/* Completed meeting banner */}
      {meeting.status === 'COMPLETED' && (
        <div className="mb-4 px-4 py-3 bg-grassy-green-light rounded-lg border border-grassy-green/20 flex-shrink-0">
          <p className="text-sm text-grassy-green font-medium">
            This meeting has been completed. Notes are read-only.
          </p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex-1 min-h-0 grid grid-cols-5 gap-6">
        {/* Left column - Agenda (60%) */}
        <div className="col-span-3 bg-white rounded-lg border border-border shadow-soft p-5 flex flex-col overflow-hidden">
          <MeetingAgenda
            meetingId={meeting.id}
            topics={meeting.topics}
            icId={meeting.relationship.ic.id}
            isReadOnly={isReadOnly}
            currentUserId={user?.id || ''}
            isLeader={isLeader}
          />
        </div>

        {/* Right column - Notes (40%) */}
        <div className="col-span-2 flex flex-col overflow-hidden">
          <MeetingNotes meetingId={meeting.id} isReadOnly={isReadOnly} />
        </div>
      </div>

      {/* Complete meeting confirmation modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Meeting"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-2 -mt-2">
          Are you sure you want to mark this meeting as complete?
        </p>
        <p className="text-sm text-text-tertiary mb-6">
          Topics will be marked as discussed and notes will become read-only.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowCompleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCompleteMeeting}
            disabled={completeMeeting.isPending}
          >
            {completeMeeting.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Complete Meeting
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default MeetingPage;
