import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  Tag,
  Pin,
  Calendar,
} from 'lucide-react';
import { DeleteIcon, BackIcon } from '@/components/icons';
import { useTopic, useUpdateTopic, useDeleteTopic } from '../../hooks/useTopics';
import { useLabels } from '../../hooks/useLabels';
import { BlockEditor } from '../../components/editor';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/Modal';
import { MeetingPicker } from '../../components/topics/MeetingPicker';
import type { Block } from '@blocknote/core';

/**
 * TopicPage Component
 * Full page view for editing a topic (same layout as ThoughtPage)
 * - Editable title (large)
 * - Label picker
 * - Status indicator (Backlog/Scheduled)
 * - Block editor for content
 * - Auto-save on changes
 * - "Add to 1:1" button for backlog topics
 * - Delete button for backlog topics
 */
export function TopicPage() {
  const { id, icId } = useParams<{ id: string; icId?: string }>();
  const navigate = useNavigate();

  // Determine back path based on whether this is IC or Leader view
  const backPath = icId ? `/team/${icId}` : '/workspace';

  const { data: topic, isLoading, error } = useTopic(id);
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();
  const { data: labels = [] } = useLabels();

  // Local state for editing
  const [title, setTitle] = useState('');
  const [labelId, setLabelId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const labelPickerRef = useRef<HTMLDivElement>(null);

  // Get the current label object
  const currentLabel = topic?.label || labels.find(l => l.id === labelId);

  // Close label picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelPickerRef.current && !labelPickerRef.current.contains(event.target as Node)) {
        setShowLabelPicker(false);
      }
    };
    if (showLabelPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLabelPicker]);

  // Initialize local state when topic loads
  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setLabelId(topic.label?.id ?? null);
    }
  }, [topic]);

  // Auto-save title on blur
  const handleTitleBlur = useCallback(() => {
    if (!id || !topic) return;
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== topic.title) {
      updateTopic.mutate({ id, title: trimmedTitle });
    }
  }, [id, title, topic, updateTopic]);

  // Auto-save content (debounced in BlockEditor)
  const handleContentChange = useCallback(
    (newContent: Block[]) => {
      if (!id) return;
      updateTopic.mutate({ id, content: newContent });
    },
    [id, updateTopic]
  );

  // Save label on change
  const handleLabelChange = useCallback(
    (newLabelId: string | null) => {
      if (!id) return;
      setLabelId(newLabelId);
      updateTopic.mutate({ id, labelId: newLabelId });
      setShowLabelPicker(false);
    },
    [id, updateTopic]
  );

  // Delete topic
  const handleDelete = useCallback(async () => {
    if (!id) return;
    try {
      await deleteTopic.mutateAsync({ id });
      navigate(backPath);
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
    setShowDeleteModal(false);
  }, [id, deleteTopic, navigate, backPath]);

  // Handle successful scheduling
  const handleScheduled = useCallback(() => {
    // Topic will be refetched automatically due to cache invalidation
  }, []);

  // Get status badge
  const getStatusBadge = () => {
    if (!topic) return null;
    switch (topic.status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-wawanesa-blue bg-wawanesa-blue/10 px-2 py-0.5 rounded">
            <Calendar className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'DISCUSSED':
        return (
          <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded">
            Discussed
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="text-xs text-text-tertiary bg-surface-secondary px-2 py-0.5 rounded">
            Archived
          </span>
        );
      default:
        return (
          <span className="text-xs text-text-tertiary bg-surface-secondary px-2 py-0.5 rounded">
            In Backlog
          </span>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-wawanesa-blue mb-3" />
        <p className="text-sm text-text-tertiary">Loading topic...</p>
      </div>
    );
  }

  // Error state
  if (error || !topic) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="p-3 rounded-full bg-error-light mb-3">
          <AlertCircle className="w-6 h-6 text-error" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">
          {error ? 'Failed to load topic' : 'Topic not found'}
        </p>
        <p className="text-xs text-text-tertiary mb-4">
          {error?.message || 'This topic may have been deleted'}
        </p>
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm text-text-secondary font-medium hover:text-text-primary transition-colors"
        >
          <BackIcon size={16} animateOnHover />
          Back
        </Link>
      </div>
    );
  }

  const isBacklog = topic.status === 'BACKLOG';

  return (
    <div className="h-full flex flex-col w-full max-w-[1120px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <Link
          to={backPath}
          className="
            inline-flex items-center gap-2
            text-sm font-medium text-text-secondary
            hover:text-text-primary
            transition-colors
          "
        >
          <BackIcon size={16} animateOnHover />
          Back
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Add to 1:1 button - only for backlog topics */}
          {isBacklog && (
            <MeetingPicker
              topicId={topic.id}
              onScheduled={handleScheduled}
            />
          )}

          {/* Delete button - only for backlog topics */}
          {isBacklog && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleteTopic.isPending}
              className="text-text-tertiary hover:text-text-secondary"
              onMouseEnter={() => setIsDeleteHovered(true)}
              onMouseLeave={() => setIsDeleteHovered(false)}
            >
              <DeleteIcon size={16} animate={isDeleteHovered} />
            </Button>
          )}
        </div>
      </div>

      {/* Main content card - fills remaining height */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-lg border border-border shadow-soft overflow-hidden">
        {/* Title section - seamless with editor */}
        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          {/* Title row: [Icon] [Title] [Status] [Label name if defined] [Label icon] */}
          <div className="flex items-center gap-2">
            {/* Pin icon */}
            <Pin className="w-5 h-5 text-text-secondary flex-shrink-0" />

            {/* Title input */}
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
              placeholder="Untitled topic..."
              className="
                flex-1 text-base font-medium text-text-secondary tracking-wide
                bg-transparent border-none
                placeholder:text-text-tertiary
                focus:outline-none focus:ring-0
              "
            />

            {/* Saving indicator - inline, no layout shift */}
            <span
              className={`
                inline-flex items-center gap-1.5 text-xs text-text-tertiary flex-shrink-0
                transition-opacity duration-200
                ${updateTopic.isPending ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving
            </span>

            {/* Status badge */}
            {getStatusBadge()}

            {/* Label name badge - only shown when label is defined */}
            {currentLabel && (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary flex-shrink-0">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentLabel.color }}
                />
                {currentLabel.name}
              </span>
            )}

            {/* Label picker icon - always shown */}
            <div className="relative flex-shrink-0" ref={labelPickerRef}>
              <button
                type="button"
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className={`
                  p-1.5 rounded transition-colors
                  ${currentLabel ? 'text-text-secondary hover:text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}
                `}
                aria-label="Set label"
              >
                <Tag className="w-3.5 h-3.5" />
              </button>

              {/* Label dropdown */}
              {showLabelPicker && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border/50 rounded shadow-md py-1 min-w-[120px]">
                  {/* Clear option */}
                  {currentLabel && (
                    <button
                      type="button"
                      onClick={() => handleLabelChange(null)}
                      className="w-full px-3 py-1.5 text-left text-xs text-text-tertiary hover:bg-black/[0.02] transition-colors"
                    >
                      None
                    </button>
                  )}
                  {/* Label options */}
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => handleLabelChange(label.id)}
                      className={`
                        w-full px-3 py-1.5 text-left text-xs flex items-center gap-2
                        hover:bg-black/[0.02] transition-colors
                        ${currentLabel?.id === label.id ? 'text-text-primary' : 'text-text-secondary'}
                      `}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="truncate">{label.name}</span>
                    </button>
                  ))}
                  {labels.length === 0 && (
                    <div className="px-3 py-1.5 text-xs text-text-tertiary">
                      No labels
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Block editor - fills remaining space with scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <BlockEditor
            key={topic.id}
            initialContent={topic.content ?? undefined}
            onChange={handleContentChange}
            className="min-h-[625px]"
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Topic"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-2 -mt-2">
          Are you sure you want to delete this topic?
        </p>
        <p className="text-sm text-text-tertiary mb-6">
          This action cannot be undone. All content will be permanently deleted.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            disabled={deleteTopic.isPending}
            onMouseEnter={() => setIsDeleteButtonHovered(true)}
            onMouseLeave={() => setIsDeleteButtonHovered(false)}
          >
            {deleteTopic.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <DeleteIcon size={16} animate={isDeleteButtonHovered} />
                Delete Topic
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default TopicPage;
