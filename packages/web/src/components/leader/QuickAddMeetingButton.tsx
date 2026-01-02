import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useCreateMeeting } from '../../hooks/useMeetings';

interface QuickAddMeetingButtonProps {
  icId: string;
  onSuccess?: () => void;
}

/**
 * QuickAddMeetingButton Component
 * Small button/link to add a single meeting
 * Opens an inline modal with date, time, and optional title
 */
export function QuickAddMeetingButton({
  icId,
  onSuccess,
}: QuickAddMeetingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Default to tomorrow at 10:00 AM
  const defaultDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const defaultTime = '10:00';

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [title, setTitle] = useState('');

  const createMeeting = useCreateMeeting();

  const handleOpen = () => {
    setDate(defaultDate);
    setTime(defaultTime);
    setTitle('');
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!createMeeting.isPending) {
      setIsOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!date || !time) return;

    const [hours, minutes] = time.split(':').map(Number);
    const scheduledAt = setMinutes(setHours(new Date(date), hours), minutes).toISOString();

    try {
      await createMeeting.mutateAsync({
        icId,
        scheduledAt,
        title: title.trim() || undefined,
      });
      onSuccess?.();
      setIsOpen(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1 text-xs text-wawanesa-blue hover:text-wawanesa-blue/80 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add single meeting
      </button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Add Meeting"
        size="sm"
      >
        <div className="space-y-4 -mt-2">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/20 focus:border-wawanesa-blue"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/20 focus:border-wawanesa-blue"
            />
          </div>

          {/* Title (optional) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Title <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="1:1 Meeting"
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/20 focus:border-wawanesa-blue"
            />
          </div>

          {/* Error message */}
          {createMeeting.isError && (
            <p className="text-sm text-red-600">
              {createMeeting.error?.message || 'Failed to create meeting. Please try again.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={createMeeting.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={createMeeting.isPending || !date || !time}
          >
            {createMeeting.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Meeting'
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export type { QuickAddMeetingButtonProps };
