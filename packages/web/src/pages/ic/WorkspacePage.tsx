import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ThoughtPanel } from '../../components/thoughts';
import { TopicPanel } from '../../components/topics';
import { ICMeetingPanel } from '../../components/ic';
import { useAddTopicToMeeting } from '../../hooks/useMeetings';

/**
 * WorkspacePage Component
 * Minimalist IC Workspace with clean sections:
 * - Left: Thoughts (timeline style)
 * - Middle: Topics (timeline style)
 * - Right: Meetings (with drag-drop support)
 *
 * Inset sidebar layout with rounded content area
 */
export function WorkspacePage() {
  const [draggedTopicId, setDraggedTopicId] = useState<string | null>(null);
  const [hoverMeetingId, setHoverMeetingId] = useState<string | null>(null);
  const addTopicToMeeting = useAddTopicToMeeting();

  // Ensure topic drops are allowed at document level
  // This is needed because Chrome sometimes doesn't generate drop events properly
  useEffect(() => {
    const handleDocumentDragOver = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('application/topic')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    document.addEventListener('dragover', handleDocumentDragOver);
    return () => document.removeEventListener('dragover', handleDocumentDragOver);
  }, []);

  // Handle topic drag events at the page level
  const handleDragStart = useCallback((e: React.DragEvent) => {
    // Check if we're dragging a topic
    if (e.dataTransfer.types.includes('application/topic')) {
      try {
        setTimeout(() => {
          const topicData = e.dataTransfer.getData('application/topic');
          if (topicData) {
            const topic = JSON.parse(topicData);
            setDraggedTopicId(topic.id);
          }
        }, 0);
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTopicId(null);
  }, []);

  // Callback when a topic is dropped on a meeting
  const handleTopicDrop = useCallback(
    async (meetingId: string, topicId: string) => {
      try {
        await addTopicToMeeting.mutateAsync({ meetingId, topicId });
        toast.success('Topic added to meeting');
      } catch (err) {
        toast.error('Failed to add topic to meeting');
        console.error('Failed to add topic to meeting:', err);
      }
      setDraggedTopicId(null);
      setHoverMeetingId(null);
    },
    [addTopicToMeeting]
  );

  // Callback when hovering over a meeting during drag
  const handleMeetingHover = useCallback((meetingId: string | null) => {
    setHoverMeetingId(meetingId);
  }, []);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Main workspace grid - 3 columns with drag-drop handling */}
      <div
        className="
          grid gap-6 lg:gap-8
          grid-cols-1 md:grid-cols-2 lg:grid-cols-3
          flex-1 min-h-0
        "
        onDragStartCapture={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Thoughts Section - scrollable */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <ThoughtPanel className="flex-1 min-h-0 overflow-y-auto" />
        </div>

        {/* Topics Section - scrollable */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <TopicPanel
            className="flex-1 min-h-0 overflow-y-auto"
            onTopicDragStart={(topicId) => setDraggedTopicId(topicId)}
            onTopicDragEnd={() => {
              // WORKAROUND: Chrome doesn't always generate drop events properly,
              // so we trigger the drop via dragEnd when hovering over a meeting
              if (draggedTopicId && hoverMeetingId) {
                handleTopicDrop(hoverMeetingId, draggedTopicId);
              } else {
                setDraggedTopicId(null);
                setHoverMeetingId(null);
              }
            }}
          />
        </div>

        {/* Meetings Section - scrollable */}
        <div className="flex flex-col min-h-0 overflow-hidden md:col-span-2 lg:col-span-1">
          <ICMeetingPanel
            className="flex-1 min-h-0"
            enableDropZone={true}
            draggedTopicId={draggedTopicId}
            onTopicDrop={handleTopicDrop}
            onMeetingHover={handleMeetingHover}
          />
        </div>
      </div>
    </div>
  );
}

export default WorkspacePage;
