import { useState, useMemo } from 'react';
import { Loader2, CalendarPlus } from 'lucide-react';
import { format, addWeeks, nextDay, setHours, setMinutes } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useGenerateMeetings } from '../../hooks/useMeetings';
import { MeetingsIcon, ICON_SIZES } from '@/components/icons';

interface GenerateMeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  icId: string;
  icName: string;
  onSuccess?: () => void;
}

type Frequency = 'WEEKLY' | 'BIWEEKLY';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

const MEETING_COUNTS = [
  { value: 4, label: '4 weeks' },
  { value: 8, label: '8 weeks' },
  { value: 12, label: '12 weeks' },
];

/**
 * GenerateMeetingsModal Component
 * Modal for generating recurring 1:1 meetings
 */
export function GenerateMeetingsModal({
  isOpen,
  onClose,
  icId,
  icName,
  onSuccess,
}: GenerateMeetingsModalProps) {
  const [frequency, setFrequency] = useState<Frequency>('WEEKLY');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [time, setTime] = useState('10:00');
  const [count, setCount] = useState(4);

  const generateMeetings = useGenerateMeetings();

  // Calculate preview dates
  const previewDates = useMemo(() => {
    const dates: Date[] = [];
    const [hours, minutes] = time.split(':').map(Number);
    const today = new Date();

    // Find the next occurrence of the selected day
    let nextDate = nextDay(today, dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6);
    nextDate = setHours(setMinutes(nextDate, minutes), hours);

    // If the next occurrence is today but time has passed, move to next week
    if (nextDate <= today) {
      nextDate = addWeeks(nextDate, 1);
    }

    const weeksToAdd = frequency === 'WEEKLY' ? 1 : 2;

    for (let i = 0; i < count; i++) {
      dates.push(nextDate);
      nextDate = addWeeks(nextDate, weeksToAdd);
    }

    return dates;
  }, [frequency, dayOfWeek, time, count]);

  const handleSubmit = async () => {
    try {
      await generateMeetings.mutateAsync({
        icId,
        frequency,
        dayOfWeek,
        time,
        count,
      });
      onSuccess?.();
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    if (!generateMeetings.isPending) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <MeetingsIcon size={ICON_SIZES.modal} />
          Generate Recurring 1:1s
        </span>
      }
      size="md"
    >
      <div className="space-y-5 -mt-2">
        {/* Subtitle */}
        <p className="text-sm text-text-tertiary">
          Schedule recurring meetings with {icName}
        </p>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Frequency
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value="WEEKLY"
                checked={frequency === 'WEEKLY'}
                onChange={() => setFrequency('WEEKLY')}
                className="w-4 h-4 text-wawanesa-blue focus:ring-wawanesa-blue/20"
              />
              <span className="text-sm text-text-primary">Weekly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value="BIWEEKLY"
                checked={frequency === 'BIWEEKLY'}
                onChange={() => setFrequency('BIWEEKLY')}
                className="w-4 h-4 text-wawanesa-blue focus:ring-wawanesa-blue/20"
              />
              <span className="text-sm text-text-primary">Every 2 Weeks</span>
            </label>
          </div>
        </div>

        {/* Day of Week */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Day
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/20 focus:border-wawanesa-blue bg-white"
          >
            {DAYS_OF_WEEK.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/20 focus:border-wawanesa-blue"
          />
        </div>

        {/* Number of meetings */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Number of meetings
          </label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/20 focus:border-wawanesa-blue bg-white"
          >
            {MEETING_COUNTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value} meetings ({option.label})
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="bg-surface-secondary rounded-lg p-4">
          <p className="text-sm font-medium text-text-secondary mb-3">
            This will create meetings on:
          </p>
          <div className="max-h-[150px] overflow-y-auto space-y-1.5">
            {previewDates.map((date, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-text-tertiary"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-wawanesa-blue" />
                <span>
                  {format(date, 'EEE, MMM d')} at {format(date, 'h:mm a')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {generateMeetings.isError && (
          <p className="text-sm text-red-600 whitespace-pre-line">
            {generateMeetings.error?.message || 'Failed to generate meetings. Please try again.'}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          disabled={generateMeetings.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSubmit}
          disabled={generateMeetings.isPending}
        >
          {generateMeetings.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4" />
              Generate {count} Meetings
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}

export type { GenerateMeetingsModalProps };
