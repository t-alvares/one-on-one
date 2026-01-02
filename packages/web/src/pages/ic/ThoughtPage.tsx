import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Lightbulb } from '@/components/animate-ui/icons/lightbulb';
import { DeleteIcon, PromoteIcon, BackIcon } from '@/components/icons';
import { useThought, useUpdateThought, usePromoteThought, useDeleteThought } from '../../hooks/useThoughts';
import { useLabels } from '../../hooks/useLabels';
import { BlockEditor } from '../../components/editor';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/Modal';
import type { Block } from '@blocknote/core';

/**
 * ThoughtPage Component
 * Full page view for editing a thought
 * - Editable title (large, Wawanesa Blue)
 * - Label picker
 * - Block editor for content
 * - Auto-save on changes
 * - "Make it a Topic" button
 */
export function ThoughtPage() {
  const { id, icId } = useParams<{ id: string; icId?: string }>();
  const navigate = useNavigate();

  // Determine back path based on whether this is IC or Leader view
  const backPath = icId ? `/team/${icId}` : '/workspace';

  const { data: thought, isLoading, error } = useThought(id);
  const updateThought = useUpdateThought();
  const promoteThought = usePromoteThought();
  const deleteThought = useDeleteThought();
  const { data: labels = [] } = useLabels();

  // Local state for editing
  const [title, setTitle] = useState('');
  const [labelId, setLabelId] = useState<string | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const [isPromoteHovered, setIsPromoteHovered] = useState(false);
  const [isPromoteButtonHovered, setIsPromoteButtonHovered] = useState(false);
  const labelPickerRef = useRef<HTMLDivElement>(null);

  // Get the current label object
  const currentLabel = thought?.label || labels.find(l => l.id === labelId);

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

  // Initialize local state when thought loads
  useEffect(() => {
    if (thought) {
      setTitle(thought.title);
      setLabelId(thought.label?.id ?? null);
    }
  }, [thought]);

  // Auto-save title on blur
  const handleTitleBlur = useCallback(() => {
    if (!id || !thought) return;
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== thought.title) {
      updateThought.mutate({ id, title: trimmedTitle });
    }
  }, [id, title, thought, updateThought]);

  // Auto-save content (debounced in BlockEditor)
  const handleContentChange = useCallback(
    (newContent: Block[]) => {
      if (!id) return;
      updateThought.mutate({ id, content: newContent });
    },
    [id, updateThought]
  );

  // Save label on change
  const handleLabelChange = useCallback(
    (newLabelId: string | null) => {
      if (!id) return;
      setLabelId(newLabelId);
      updateThought.mutate({ id, labelId: newLabelId });
      setShowLabelPicker(false);
    },
    [id, updateThought]
  );

  // Promote to topic
  const handlePromote = useCallback(async () => {
    if (!id) return;
    try {
      await promoteThought.mutateAsync({ id, labelId: labelId ?? undefined });
      // Navigate back - topic will appear in Topics list
      navigate(backPath);
    } catch (error) {
      console.error('Failed to promote thought:', error);
    }
    setShowPromoteModal(false);
  }, [id, labelId, promoteThought, navigate, backPath]);

  // Delete thought
  const handleDelete = useCallback(async () => {
    if (!id) return;
    try {
      await deleteThought.mutateAsync({ id });
      navigate(backPath);
    } catch (error) {
      console.error('Failed to delete thought:', error);
    }
    setShowDeleteModal(false);
  }, [id, deleteThought, navigate, backPath]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-wawanesa-blue mb-3" />
        <p className="text-sm text-text-tertiary">Loading thought...</p>
      </div>
    );
  }

  // Error state
  if (error || !thought) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="p-3 rounded-full bg-error-light mb-3">
          <AlertCircle className="w-6 h-6 text-error" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">
          {error ? 'Failed to load thought' : 'Thought not found'}
        </p>
        <p className="text-xs text-text-tertiary mb-4">
          {error?.message || 'This thought may have been deleted'}
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
          {/* Promote to Topic button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPromoteModal(true)}
            disabled={promoteThought.isPending}
            onMouseEnter={() => setIsPromoteHovered(true)}
            onMouseLeave={() => setIsPromoteHovered(false)}
          >
            <PromoteIcon size={16} animate={isPromoteHovered} />
            Make it a Topic
          </Button>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteThought.isPending}
            className="text-text-tertiary hover:text-text-secondary"
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
          >
            <DeleteIcon size={16} animate={isDeleteHovered} />
          </Button>
        </div>
      </div>

      {/* Main content card - fills remaining height */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-lg border border-border shadow-soft overflow-hidden">
        {/* Title section - seamless with editor */}
        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          {/* Title row: [Icon] [Title] [Label name if defined] [Label icon] */}
          <div className="flex items-center gap-2">
            {/* Lightbulb icon - same as ThoughtsPanel */}
            <Lightbulb size={25} animateOnHover className="text-text-secondary" />

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
              placeholder="Untitled thought..."
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
                ${updateThought.isPending ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving
            </span>

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
            key={thought.id}
            initialContent={thought.content ?? undefined}
            onChange={handleContentChange}
            className="min-h-[625px]"
          />
        </div>
      </div>

      {/* Promote confirmation modal */}
      <Modal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
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
            onClick={() => setShowPromoteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePromote}
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

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Thought"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-2 -mt-2">
          Are you sure you want to delete this thought?
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
            disabled={deleteThought.isPending}
            onMouseEnter={() => setIsDeleteButtonHovered(true)}
            onMouseLeave={() => setIsDeleteButtonHovered(false)}
          >
            {deleteThought.isPending ? (
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

export default ThoughtPage;
