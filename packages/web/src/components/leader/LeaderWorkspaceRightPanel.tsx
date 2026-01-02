import { Zap } from 'lucide-react';
import { useICContext } from '../../contexts/ICContext';
import { LeaderMeetingPanel } from './LeaderMeetingPanel';

interface LeaderWorkspaceRightPanelProps {
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
 * LeaderWorkspaceRightPanel Component
 * Split 50/50 layout: Meetings on top, Actions on bottom
 * Each section has its own scroll area
 */
export function LeaderWorkspaceRightPanel({
  className = '',
  enableDropZone = false,
  draggedTopicId = null,
  onTopicDrop,
  onMeetingHover,
}: LeaderWorkspaceRightPanelProps) {
  const { ic } = useICContext();

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Top half: Meetings Section - exactly 50% with overflow hidden */}
      <div className="h-1/2 flex flex-col overflow-hidden pb-2">
        <LeaderMeetingPanel
          className="h-full overflow-hidden"
          enableDropZone={enableDropZone}
          draggedTopicId={draggedTopicId}
          onTopicDrop={onTopicDrop}
          onMeetingHover={onMeetingHover}
        />
      </div>

      {/* Subtle divider */}
      <div className="border-t border-border my-2 flex-shrink-0" />

      {/* Bottom half: Actions Section - exactly 50% with overflow hidden */}
      <div className="h-1/2 flex flex-col overflow-hidden">
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary mb-4 tracking-wide flex-shrink-0">
          <Zap className="w-[25px] h-[25px]" />
          Actions
        </h2>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-border rounded-lg bg-gray-50/30">
            <Zap className="w-8 h-8 text-text-tertiary mb-3" />
            <p className="text-sm text-text-tertiary text-center">
              Action items coming soon
            </p>
            {ic && (
              <p className="text-xs text-text-tertiary text-center mt-1">
                Track follow-ups with {ic.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { LeaderWorkspaceRightPanelProps };
