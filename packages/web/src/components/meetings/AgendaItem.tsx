import { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, X, User, Users } from 'lucide-react';
import { BlockEditor } from '../editor';
import type { MeetingTopic } from '../../hooks/useMeetings';

interface AgendaItemProps {
  topic: MeetingTopic;
  isReadOnly?: boolean;
  canRemove?: boolean;
  onRemove?: (topicId: string) => void;
}

/**
 * AgendaItem Component
 * Displays a single topic in the meeting agenda
 * - Expandable to show topic content
 * - Shows who added the topic
 * - Optional remove button
 */
export function AgendaItem({
  topic,
  isReadOnly = false,
  canRemove = false,
  onRemove,
}: AgendaItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.(topic.id);
    },
    [topic.id, onRemove]
  );

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="border border-border rounded-lg bg-white overflow-hidden">
      {/* Header row - clickable to expand */}
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-secondary/50 transition-colors"
      >
        {/* Expand/collapse icon */}
        <span className="text-text-tertiary flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>

        {/* Topic title */}
        <span className="flex-1 text-sm font-medium text-text-primary truncate">
          {topic.title}
        </span>

        {/* Label badge */}
        {topic.label && (
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: `${topic.label.color}20`,
              color: topic.label.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: topic.label.color }}
            />
            {topic.label.name}
          </span>
        )}

        {/* Who added indicator */}
        <span className="inline-flex items-center gap-1 text-xs text-text-tertiary flex-shrink-0">
          {topic.addedBy.isCurrentUser ? (
            <>
              <User className="w-3 h-3" />
              You added
            </>
          ) : (
            <>
              <Users className="w-3 h-3" />
              {topic.addedBy.name} added
            </>
          )}
        </span>

        {/* Remove button */}
        {canRemove && !isReadOnly && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 rounded text-text-tertiary hover:text-error hover:bg-error-light transition-colors flex-shrink-0"
            aria-label="Remove from agenda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border/50">
          <div className="pt-3">
            {/* Topic content - readonly BlockEditor */}
            <BlockEditor
              key={topic.id}
              initialContent={[]}
              editable={false}
              className="min-h-[100px] bg-surface-secondary/30 rounded-md p-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendaItem;
