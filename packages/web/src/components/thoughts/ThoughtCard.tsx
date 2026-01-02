import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SquarePen, GripVertical, Tag, Loader2 } from 'lucide-react';
import type { Thought } from '../../hooks/useThoughts';
import { useLabels } from '../../hooks/useLabels';
import { DeleteIcon } from '@/components/icons';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';

interface ThoughtCardProps {
  /** The thought to display */
  thought: Thought;
  /** Delete handler */
  onDelete?: (thought: Thought) => void;
  /** Title update handler for inline editing */
  onTitleUpdate?: (thought: Thought, newTitle: string) => void;
  /** Label update handler */
  onLabelUpdate?: (thought: Thought, labelId: string | null) => void;
  /** Custom navigation handler (overrides default) */
  onNavigate?: (thought: Thought) => void;
  /** Drag and drop handlers */
  onDragStart?: (thought: Thought) => void;
  onDragOver?: (event: React.DragEvent, thought: Thought) => void;
  onDragEnd?: () => void;
  onDrop?: (thought: Thought) => void;
  /** Whether this card is currently being dragged over */
  isDragOver?: boolean;
  /** Whether dragging is enabled */
  isDraggable?: boolean;
}

/**
 * ThoughtCard Component
 * Minimalist timeline-style thought item
 * - Circle marker on the left (part of connecting line)
 * - Editable title
 * - Subtle hover actions (x to delete, → to open)
 * - Drag handle on hover for reordering
 */
export function ThoughtCard({
  thought,
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
}: ThoughtCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(thought.title);
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

  // Update local state when thought changes
  useEffect(() => {
    setEditTitle(thought.title);
  }, [thought.title]);

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
      onLabelUpdate(thought, labelId);
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
    if (trimmed && trimmed !== thought.title && onTitleUpdate) {
      onTitleUpdate(thought, trimmed);
    } else {
      setEditTitle(thought.title);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTitleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditTitle(thought.title);
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
      onDelete(thought);
      setShowDeleteModal(false);
    }
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(thought);
    } else {
      navigate(`/workspace/thoughts/${thought.id}`);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Allow both 'move' (reordering) and 'copy' (promoting to topic)
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', thought.id);
    // Set thought data for cross-panel drag (Thought → Topic promotion)
    e.dataTransfer.setData('application/thought', JSON.stringify({
      id: thought.id,
      title: thought.title,
      labelId: thought.label?.id ?? null,
    }));
    onDragStart?.(thought);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(e, thought);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop?.(thought);
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
        {/* Title and label - label flows inline after title */}
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
              {thought.title}
              {/* Label badge - inline after title text */}
              {thought.label && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary ml-2 align-baseline">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: thought.label.color }}
                  />
                  {thought.label.name}
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
                  {thought.label && (
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
                        ${thought.label?.id === label.id ? 'text-text-primary' : 'text-text-secondary'}
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

          {/* Delete */}
          {onDelete && (
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
        title="Delete Thought"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-2 -mt-2">
          Are you sure you want to delete "{thought.title}"?
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
                Delete Thought
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export type { ThoughtCardProps };
