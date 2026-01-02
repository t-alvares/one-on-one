import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useICContext } from '@/contexts/ICContext';
import { LeaderThoughtPanel, LeaderTopicPanel, LeaderWorkspaceRightPanel } from '@/components/leader';
import { useAddTopicToMeeting } from '@/hooks/useMeetings';

/**
 * ICWorkspaceContent - Inner component that uses ICContext
 */
function ICWorkspaceContent() {
  const { ic, icId, isLoading, error } = useICContext();
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

  // All hooks must be called unconditionally BEFORE any early returns
  // Handle topic drag events at the page level
  const handleDragStart = useCallback((e: React.DragEvent) => {
    // Check if we're dragging a topic
    if (e.dataTransfer.types.includes('application/topic')) {
      try {
        // Note: getData doesn't work in dragstart, we need to listen for it in dragenter/over
        // Just set a flag that something is being dragged
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
      if (!icId) return;

      try {
        await addTopicToMeeting.mutateAsync({
          meetingId,
          topicId,
          icId,
        });
        toast.success('Topic scheduled for meeting');
      } catch (err) {
        toast.error('Failed to schedule topic');
        console.error('Failed to add topic to meeting:', err);
      }
      setDraggedTopicId(null);
      setHoverMeetingId(null);
    },
    [addTopicToMeeting, icId]
  );

  // Callback when hovering over a meeting during drag
  const handleMeetingHover = useCallback((meetingId: string | null) => {
    setHoverMeetingId(meetingId);
  }, []);

  // Early returns AFTER all hooks have been called
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !ic) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
        <p className="text-red-500 mb-2">Failed to load team member</p>
        <Link
          to="/team"
          className="text-sm text-wawanesa-blue hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to team
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Three-column layout with drag-drop handling */}
      <div
        className="flex-1 grid grid-cols-3 gap-6 min-h-0"
        onDragStartCapture={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Left: Thoughts */}
        <LeaderThoughtPanel className="min-h-0 overflow-hidden" />

        {/* Middle: Topics */}
        <LeaderTopicPanel
          className="min-h-0 overflow-hidden"
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

        {/* Right: Meetings + Actions */}
        <LeaderWorkspaceRightPanel
          className="min-h-0 overflow-hidden"
          enableDropZone={true}
          draggedTopicId={draggedTopicId}
          onTopicDrop={handleTopicDrop}
          onMeetingHover={handleMeetingHover}
        />
      </div>
    </div>
  );
}

/**
 * ICWorkspacePage
 * Leader's workspace for a specific IC
 * Route: /team/:icId
 * Note: ICProvider is provided by LeaderICLayout in App.tsx
 */
export function ICWorkspacePage() {
  return <ICWorkspaceContent />;
}
