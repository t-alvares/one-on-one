import { useState, useCallback } from 'react';
import { Plus, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { TopicsIcon, ICON_SIZES, PromoteIcon } from '@/components/icons';
import {
  useLeaderTopics,
  useDeleteLeaderTopic,
  useUpdateLeaderTopic,
  useCreateLeaderTopic,
  type Topic,
} from '../../hooks/useLeaderTopics';
import { usePromoteLeaderThought } from '../../hooks/useLeaderThoughts';
import { useICContext } from '../../contexts/ICContext';
import { LeaderTopicCard } from './LeaderTopicCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';

type FilterTab = 'backlog' | 'scheduled' | 'discussed';

interface LeaderTopicPanelProps {
  /** Additional class names */
  className?: string;
  /** Callback when a topic starts being dragged */
  onTopicDragStart?: (topicId: string) => void;
  /** Callback when a topic drag ends */
  onTopicDragEnd?: () => void;
}

// Type for pending thought promotion
interface PendingThought {
  id: string;
  title: string;
  labelId: string | null;
}

/**
 * LeaderTopicPanel Component
 * Displays topics for Leader's IC workspace with two views:
 * - "Backlog" - Leader's topics to potentially discuss (editable)
 * - "Discussed" - Historical record of discussed topics (both parties, read-only)
 *
 * Privacy model:
 * - IC's BACKLOG topics are private (never shown)
 * - IC's SCHEDULED topics live in meeting context (not shown here)
 * - IC's DISCUSSED topics appear in the Discussed tab (shared history)
 */
export function LeaderTopicPanel({
  className = '',
  onTopicDragStart,
  onTopicDragEnd,
}: LeaderTopicPanelProps) {
  const { icId, ic } = useICContext();
  const [activeTab, setActiveTab] = useState<FilterTab>('backlog');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [draggedTopic, setDraggedTopic] = useState<Topic | null>(null);
  const [dragOverTopic, setDragOverTopic] = useState<Topic | null>(null);
  const [isThoughtDragOver, setIsThoughtDragOver] = useState(false);
  const [pendingThought, setPendingThought] = useState<PendingThought | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [isPromoteButtonHovered, setIsPromoteButtonHovered] = useState(false);

  // Fetch BACKLOG topics (Leader's only, no counterparty)
  const {
    data: backlogTopics = [],
    isLoading: isLoadingBacklog,
    error: errorBacklog,
    refetch: refetchBacklog,
  } = useLeaderTopics(icId, {
    status: 'BACKLOG',
    includeCounterparty: false,
  });

  // Fetch SCHEDULED topics (Leader's only, no counterparty - IC's scheduled are private)
  const {
    data: scheduledTopics = [],
    isLoading: isLoadingScheduled,
    error: errorScheduled,
    refetch: refetchScheduled,
  } = useLeaderTopics(icId, {
    status: 'SCHEDULED',
    includeCounterparty: false,
  });

  // Fetch DISCUSSED topics (both Leader's and IC's)
  const {
    data: discussedTopics = [],
    isLoading: isLoadingDiscussed,
    error: errorDiscussed,
    refetch: refetchDiscussed,
  } = useLeaderTopics(icId, {
    status: 'DISCUSSED',
    includeCounterparty: true,
  });

  const deleteTopic = useDeleteLeaderTopic(icId);
  const updateTopic = useUpdateLeaderTopic(icId);
  const createTopic = useCreateLeaderTopic();
  const promoteThought = usePromoteLeaderThought(icId);

  // Get current topics based on active tab
  const currentTopics =
    activeTab === 'backlog'
      ? backlogTopics
      : activeTab === 'scheduled'
        ? scheduledTopics
        : discussedTopics;
  const isLoading =
    activeTab === 'backlog'
      ? isLoadingBacklog
      : activeTab === 'scheduled'
        ? isLoadingScheduled
        : isLoadingDiscussed;
  const error =
    activeTab === 'backlog'
      ? errorBacklog
      : activeTab === 'scheduled'
        ? errorScheduled
        : errorDiscussed;
  const refetch =
    activeTab === 'backlog'
      ? refetchBacklog
      : activeTab === 'scheduled'
        ? refetchScheduled
        : refetchDiscussed;

  // Counts for tab badges
  const backlogCount = backlogTopics.length;
  const scheduledCount = scheduledTopics.length;
  const discussedCount = discussedTopics.length;

  const handleDelete = (topic: Topic) => {
    if (!topic.isCounterparty) {
      deleteTopic.mutate({ id: topic.id });
    }
  };

  const handleTitleUpdate = useCallback(
    (topic: Topic, newTitle: string) => {
      if (!topic.isCounterparty) {
        updateTopic.mutate({ id: topic.id, title: newTitle });
      }
    },
    [updateTopic]
  );

  const handleLabelUpdate = useCallback(
    (topic: Topic, labelId: string | null) => {
      if (!topic.isCounterparty) {
        updateTopic.mutate({ id: topic.id, labelId });
      }
    },
    [updateTopic]
  );

  const handleAddTopic = useCallback(async () => {
    const trimmed = newTopicTitle.trim();
    if (!trimmed || !icId) return;

    try {
      await createTopic.mutateAsync({ title: trimmed, aboutIcId: icId });
      setNewTopicTitle('');
      setIsAddingTopic(false);
    } catch (err) {
      console.error('Failed to create topic:', err);
    }
  }, [newTopicTitle, createTopic, icId]);

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    } else if (e.key === 'Escape') {
      setNewTopicTitle('');
      setIsAddingTopic(false);
    }
  };

  // Drag and drop handlers (for reordering within panel - backlog only)
  const handleDragStart = useCallback((topic: Topic) => {
    if (!topic.isCounterparty) {
      setDraggedTopic(topic);
      // Notify parent about drag start (for meeting drop zones)
      onTopicDragStart?.(topic.id);
    }
  }, [onTopicDragStart]);

  const handleDragOver = useCallback(
    (_event: React.DragEvent, topic: Topic) => {
      if (draggedTopic && topic.id !== draggedTopic.id) {
        setDragOverTopic(topic);
      }
    },
    [draggedTopic]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedTopic(null);
    setDragOverTopic(null);
    // Notify parent about drag end
    onTopicDragEnd?.();
  }, [onTopicDragEnd]);

  const handleDrop = useCallback(
    (_targetTopic: Topic) => {
      // Reordering can be implemented later
      handleDragEnd();
    },
    [handleDragEnd]
  );

  // Panel-level drop zone handlers for Thought -> Topic promotion (backlog only)
  const handlePanelDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/thought')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsThoughtDragOver(true);
    }
  }, []);

  const handlePanelDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsThoughtDragOver(false);
    }
  }, []);

  // Use capture phase to intercept thought drops before they reach LeaderTopicCards
  const handlePanelDropCapture = useCallback((e: React.DragEvent) => {
    const thoughtData = e.dataTransfer.getData('application/thought');
    if (thoughtData) {
      e.preventDefault();
      e.stopPropagation();
      setIsThoughtDragOver(false);

      try {
        const thought = JSON.parse(thoughtData);
        setPendingThought(thought);
        setShowPromoteModal(true);
      } catch (err) {
        console.error('Failed to parse thought data:', err);
      }
    }
  }, []);

  // Handle confirmed promotion
  const handleConfirmPromote = useCallback(async () => {
    if (!pendingThought) return;
    try {
      await promoteThought.mutateAsync({
        id: pendingThought.id,
        labelId: pendingThought.labelId ?? undefined,
      });
    } catch (err) {
      console.error('Failed to promote thought:', err);
    }
    setShowPromoteModal(false);
    setPendingThought(null);
  }, [pendingThought, promoteThought]);

  // Handle cancel promotion
  const handleCancelPromote = useCallback(() => {
    setShowPromoteModal(false);
    setPendingThought(null);
  }, []);

  // Regular drop handler for topic drops (bubbling phase)
  const handlePanelDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsThoughtDragOver(false);
  }, []);

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'backlog', label: 'Backlog', count: backlogCount },
    { key: 'scheduled', label: 'Scheduled', count: scheduledCount },
    { key: 'discussed', label: 'Discussed', count: discussedCount },
  ];

  // Check if we're in backlog mode (editable)
  const isBacklogMode = activeTab === 'backlog';

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with title and filter tabs */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary tracking-wide">
          <TopicsIcon size={ICON_SIZES.sectionHeader} animateOnHover />
          Topics
        </h2>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-2 py-1 text-xs rounded transition-colors
                ${
                  activeTab === tab.key
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-text-tertiary">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content - scrollable */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-text-tertiary py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : error ? (
        <div className="py-4">
          <div className="flex items-center gap-2 text-text-tertiary mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to load</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs text-text-tertiary hover:text-text-secondary"
          >
            Try again
          </button>
        </div>
      ) : (
        <div
          className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
          onDragOver={isBacklogMode ? handlePanelDragOver : undefined}
          onDragLeave={isBacklogMode ? handlePanelDragLeave : undefined}
          onDropCapture={isBacklogMode ? handlePanelDropCapture : undefined}
          onDrop={isBacklogMode ? handlePanelDrop : undefined}
        >
          {/* Vertical connecting line */}
          {(currentTopics.length > 0 || (isBacklogMode && isAddingTopic)) && (
            <div
              className="absolute left-[5px] top-[10px] w-[1px] bg-border"
              style={{
                height: `calc(100% - ${isBacklogMode && isAddingTopic ? '10px' : '20px'})`,
              }}
            />
          )}

          {/* Topics list */}
          <div className="space-y-0">
            {currentTopics.map((topic) => (
              <LeaderTopicCard
                key={topic.id}
                topic={topic}
                onDelete={isBacklogMode && !topic.isCounterparty ? handleDelete : undefined}
                onTitleUpdate={isBacklogMode && !topic.isCounterparty ? handleTitleUpdate : undefined}
                onLabelUpdate={isBacklogMode && !topic.isCounterparty ? handleLabelUpdate : undefined}
                onDragStart={isBacklogMode ? handleDragStart : undefined}
                onDragOver={isBacklogMode ? handleDragOver : undefined}
                onDragEnd={isBacklogMode ? handleDragEnd : undefined}
                onDrop={isBacklogMode ? handleDrop : undefined}
                isDragOver={dragOverTopic?.id === topic.id}
                isDraggable={isBacklogMode && !topic.isCounterparty}
              />
            ))}
          </div>

          {/* Empty state */}
          {currentTopics.length === 0 && !isAddingTopic && !isThoughtDragOver && (
            <p className="text-sm text-text-tertiary py-2">
              {activeTab === 'backlog'
                ? 'No topics yet. Add one or drag a thought here!'
                : activeTab === 'scheduled'
                  ? 'No topics scheduled for upcoming meetings.'
                  : `No topics have been discussed with ${ic?.name || 'this person'} yet.`}
            </p>
          )}

          {/* Add new topic - only in backlog mode */}
          {isBacklogMode && (
            <div className="flex items-center gap-3 group">
              {/* Circle on the line */}
              <div className="relative z-10 w-[11px] h-[11px] rounded-full border border-border bg-white flex-shrink-0" />

              {isAddingTopic ? (
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                  onBlur={() => {
                    if (!newTopicTitle.trim()) {
                      setIsAddingTopic(false);
                    }
                  }}
                  placeholder="Type your topic..."
                  autoFocus
                  className="
                    flex-1 py-2 text-sm text-text-primary
                    bg-transparent border-none outline-none
                    placeholder:text-text-tertiary
                  "
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTopic(true)}
                  className="
                    flex items-center gap-1.5 py-2
                    text-sm text-text-tertiary
                    hover:text-text-secondary
                    transition-colors
                  "
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add topic</span>
                </button>
              )}
            </div>
          )}

          {/* Drop zone indicator for thought promotion - backlog only */}
          {isBacklogMode && isThoughtDragOver && (
            <div className="mt-1.5 ml-[23px] p-3 rounded-md border border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center gap-2 text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Drop to promote to Topic</span>
            </div>
          )}
        </div>
      )}

      {/* Promote confirmation modal */}
      <Modal
        isOpen={showPromoteModal}
        onClose={handleCancelPromote}
        title="Promote to Topic"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-2 -mt-2">
          This will convert your thought into a topic that can be added to 1:1 meetings.
        </p>
        <p className="text-sm text-text-tertiary mb-6">
          All content will be preserved. The thought will be deleted after promotion.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelPromote}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleConfirmPromote}
            disabled={promoteThought.isPending}
            onMouseEnter={() => setIsPromoteButtonHovered(true)}
            onMouseLeave={() => setIsPromoteButtonHovered(false)}
          >
            {promoteThought.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Promoting...
              </>
            ) : (
              <>
                <PromoteIcon size={16} animate={isPromoteButtonHovered} />
                Promote to Topic
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export type { LeaderTopicPanelProps };
