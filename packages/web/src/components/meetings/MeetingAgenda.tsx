import { useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TopicsIcon, ICON_SIZES } from '../icons';
import { AgendaItem } from './AgendaItem';
import { useRemoveTopicFromMeeting, type MeetingTopic } from '../../hooks/useMeetings';

interface MeetingAgendaProps {
  meetingId: string;
  topics: MeetingTopic[];
  icId?: string;
  isReadOnly?: boolean;
  currentUserId: string;
  isLeader: boolean;
}

/**
 * MeetingAgenda Component
 * Left column of the meeting page showing the agenda (topics)
 * - Lists all topics added to this meeting
 * - Allows removing topics (own topics or if Leader)
 * - Shows empty state when no topics
 */
export function MeetingAgenda({
  meetingId,
  topics,
  icId,
  isReadOnly = false,
  currentUserId,
  isLeader,
}: MeetingAgendaProps) {
  const [removingTopicId, setRemovingTopicId] = useState<string | null>(null);
  const removeTopic = useRemoveTopicFromMeeting();

  const handleRemoveTopic = useCallback(
    async (topicId: string) => {
      setRemovingTopicId(topicId);
      try {
        await removeTopic.mutateAsync({ meetingId, topicId, icId });
      } catch (error) {
        console.error('Failed to remove topic:', error);
      } finally {
        setRemovingTopicId(null);
      }
    },
    [meetingId, icId, removeTopic]
  );

  // Can remove if: user added the topic OR user is the Leader
  const canRemoveTopic = (topic: MeetingTopic) => {
    if (isReadOnly) return false;
    return topic.addedBy.id === currentUserId || isLeader;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary tracking-wide">
          <TopicsIcon size={ICON_SIZES.sectionHeader} animateOnHover />
          Agenda
          {topics.length > 0 && (
            <span className="text-text-tertiary">({topics.length})</span>
          )}
        </h2>
      </div>

      {/* Topics list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {topics.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary">
            <p className="text-sm">No topics added yet.</p>
            <p className="text-xs mt-1">
              {isReadOnly
                ? 'This meeting has no agenda items.'
                : 'Drag topics here to build your agenda.'}
            </p>
          </div>
        ) : (
          topics
            .sort((a, b) => a.order - b.order)
            .map((topic) => (
              <div key={topic.id} className="relative">
                {removingTopicId === topic.id && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
                  </div>
                )}
                <AgendaItem
                  topic={topic}
                  isReadOnly={isReadOnly}
                  canRemove={canRemoveTopic(topic)}
                  onRemove={handleRemoveTopic}
                />
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default MeetingAgenda;
