import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SquarePen, GripVertical, Tag, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Topic } from '../../hooks/useTopics';
import { useLabels } from '../../hooks/useLabels';
import { DeleteIcon } from '@/components/icons';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';

interface TopicCardProps {
  /** The topic to display */
  topic: Topic;
  /** Delete handler */
  onDelete?: (topic: Topic) => void;
  /** Title update handler for inline editing */
  onTitleUpdate?: (topic: Topic, newTitle: string) => void;
  /** Label update handler */
  onLabelUpdate?: (topic: Topic, labelId: string | null) => void;
  /** Custom navigation handler (overrides default) */
  onNavigate?: (topic: Topic) => void;
  /** Drag and drop handlers */
  onDragStart?: (topic: Topic) => void;
  onDragOver?: (event: React.DragEvent, topic: Topic) => void;
  onDragEnd?: () => void;
  onDrop?: (topic: Topic) => void;
  /** Whether this card is currently being dragged over */
  isDragOver?: boolean;
  /** Whether dragging is enabled */
  isDraggable?: boolean;
}

/**
 * TopicCard Component
 * Minimalist timeline-style topic item (same layout as ThoughtCard)
 * - Circle marker on the left (part of connecting line)
 * - Editable title
 * - Status badge (Backlog/Scheduled)
 * - Subtle hover actions (x to delete, edit to open)
 * - Drag handle on hover for reordering
 */
export function TopicCard({
  topic,
  onDelete,
  onTitleUpdate,
  onLabelUpdate,
  onNavigate,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragOver = false,
  isDraggable = false,
}: TopicCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic.title);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelPickerRef = useRef<HTMLDivElement>(null);

  const { data: labels = [] } = useLabels();

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update local state when topic changes
  useEffect(() => {
    setEditTitle(topic.title);
  }, [topic.title]);

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

  const handleLabelSelect = (labelId: string | null) => {
    if (onLabelUpdate) {
      onLabelUpdate(topic, labelId);
    }
    setShowLabelPicker(false);
  };

  const handleTitleClick = () => {
    if (onTitleUpdate) {
      setIsEditing(true);
    }
  };

  const handleTitleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== topic.title && onTitleUpdate) {
      onTitleUpdate(topic, trimmed);
    } else {
      setEditTitle(topic.title);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTitleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditTitle(topic.title);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete && !isDeleting) {
      setIsDeleting(true);
      onDelete(topic);
      setShowDeleteModal(false);
    }
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(topic);
    } else {
      navigate(`/workspace/topics/${topic.id}`);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', topic.id);
    e.dataTransfer.setData('application/topic', JSON.stringify({ id: topic.id, title: topic.title }));
    onDragStart?.(topic);
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Always allow drops by calling preventDefault (required for drop to work)
    e.preventDefault();

    // Set appropriate drop effect based on drag type
    if (e.dataTransfer.types.includes('application/topic')) {
      e.dataTransfer.dropEffect = 'move';
      onDragOver?.(e, topic);
    } else if (e.dataTransfer.types.includes('application/thought')) {
      e.dataTransfer.dropEffect = 'copy';
      // Don't call onDragOver - let parent handle thought drag state
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    // Only handle topic drops directly, let thought drops bubble to parent
    if (e.dataTransfer.types.includes('application/topic')) {
      e.preventDefault();
      e.stopPropagation();
      onDrop?.(topic);
    }
    // For thought drops: don't preventDefault or stopPropagation - let it bubble to TopicPanel
  };

  // Navigate to meeting when clicking scheduled badge
  const handleScheduledClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (topic.nextMeeting) {
      navigate(`/meetings/${topic.nextMeeting.id}`);
    }
  };

  // Determine status badge color
  const getStatusBadge = () => {
    switch (topic.status) {
      case 'SCHEDULED':
        // If we have meeting info, show the date and make it clickable
        if (topic.nextMeeting) {
          const meetingDate = new Date(topic.nextMeeting.scheduledAt);
          return (
            <button
              onClick={handleScheduledClick}
              className="inline-flex items-center gap-1 text-xs text-wawanesa-blue hover:text-wawanesa-blue/80 hover:underline transition-colors"
            >
              <Calendar className="w-3 h-3" />
              {format(meetingDate, 'EEE, MMM d')}
            </button>
          );
        }
        // Fallback without meeting info
        return (
          <span className="inline-flex items-center gap-1 text-xs text-wawanesa-blue">
            <Calendar className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'DISCUSSED':
        return (
          <span className="text-xs text-success">Discussed</span>
        );
      case 'ARCHIVED':
        return (
          <span className="text-xs text-text-tertiary">Archived</span>
        );
      default:
        return null; // BACKLOG - no badge needed
    }
  };

  return (
    <div
      draggable={isDraggable && !isEditing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
      onDrop={handleDrop}
      className={`
        group flex items-start gap-3 py-2 rounded
        ${isDeleting ? 'opacity-40 pointer-events-none' : ''}
        ${isDragOver ? 'bg-surface-elevated' : ''}
        transition-colors
      `}
    >
      {/* Circle marker on the line */}
      <div className="relative z-10 mt-1.5 w-[11px] h-[11px] rounded-full border border-border bg-white flex-shrink-0 group-hover:border-text-tertiary transition-colors" />

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        {/* Title, label, and status - label flows inline after title */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="
                w-full text-sm text-text-primary
                bg-transparent border-none outline-none
                focus:ring-0 p-0
              "
            />
          ) : (
            <p
              onClick={handleTitleClick}
              className={`
                text-sm text-text-primary leading-relaxed
                ${onTitleUpdate ? 'cursor-text' : ''}
              `}
            >
              {topic.title}
              {/* Label badge - inline after title text */}
              {topic.label && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary ml-2 align-baseline">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: topic.label.color }}
                  />
                  {topic.label.name}
                </span>
              )}
              {/* Status badge - inline after label */}
              {topic.status !== 'BACKLOG' && (
                <span className="ml-2 align-baseline">
                  {getStatusBadge()}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Actions: label, edit, close, drag */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Label picker */}
          {onLabelUpdate && (
            <div className="relative" ref={labelPickerRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLabelPicker(!showLabelPicker);
                }}
                className="p-1 rounded transition-colors text-text-tertiary hover:text-text-secondary"
                aria-label="Label"
              >
                <Tag className="w-3.5 h-3.5" />
              </button>

              {/* Label dropdown - minimalist */}
              {showLabelPicker && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border/50 rounded shadow-sm py-1 min-w-[100px]">
                  {/* Clear option */}
                  {topic.label && (
                    <button
                      type="button"
                      onClick={() => handleLabelSelect(null)}
                      className="w-full px-2.5 py-1 text-left text-xs text-text-tertiary hover:bg-black/[0.02] transition-colors"
                    >
                      None
                    </button>
                  )}
                  {/* Label options */}
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => handleLabelSelect(label.id)}
                      className={`
                        w-full px-2.5 py-1 text-left text-xs flex items-center gap-2
                        hover:bg-black/[0.02] transition-colors
                        ${topic.label?.id === label.id ? 'text-text-primary' : 'text-text-secondary'}
                      `}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="truncate">{label.name}</span>
                    </button>
                  ))}
                  {labels.length === 0 && (
                    <div className="px-2.5 py-1 text-xs text-text-tertiary">
                      No labels
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Edit */}
          <button
            type="button"
            onClick={handleNavigate}
            className="
              p-1 rounded
              text-text-tertiary
              hover:text-text-secondary
              transition-colors
            "
            aria-label="Edit"
          >
            <SquarePen className="w-3.5 h-3.5" />
          </button>

          {/* Delete - only for BACKLOG topics */}
          {onDelete && topic.status === 'BACKLOG' && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="
                p-1 rounded
                text-text-tertiary
                hover:text-text-secondary
                transition-colors
              "
              aria-label="Delete"
            >
              <DeleteIcon size={14} />
            </button>
          )}

          {/* Drag handle */}
          {isDraggable && (
            <div className="p-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-3.5 h-3.5 text-text-tertiary" />
            </div>
          )}
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
          Are you sure you want to delete "{topic.title}"?
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
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            onMouseEnter={() => setIsDeleteButtonHovered(true)}
            onMouseLeave={() => setIsDeleteButtonHovered(false)}
          >
            {isDeleting ? (
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

export type { TopicCardProps };
