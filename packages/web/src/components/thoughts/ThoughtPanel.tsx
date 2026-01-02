import { useState, useCallback } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Lightbulb } from '@/components/animate-ui/icons/lightbulb';
import { useThoughts, useDeleteThought, useUpdateThought, useCreateThought, useReorderThoughts, type Thought } from '../../hooks/useThoughts';
import { ThoughtCard } from './ThoughtCard';

interface ThoughtPanelProps {
  /** Additional class names */
  className?: string;
}

/**
 * ThoughtPanel Component
 * Minimalist timeline-style thought list
 * - Clean title
 * - Vertical line connecting thoughts
 * - Add new thought at bottom
 */
export function ThoughtPanel({ className = '' }: ThoughtPanelProps) {
  const [newThoughtTitle, setNewThoughtTitle] = useState('');
  const [isAddingThought, setIsAddingThought] = useState(false);
  const [draggedThought, setDraggedThought] = useState<Thought | null>(null);
  const [dragOverThought, setDragOverThought] = useState<Thought | null>(null);

  const { data: thoughts = [], isLoading, error, refetch } = useThoughts();
  const deleteThought = useDeleteThought();
  const updateThought = useUpdateThought();
  const createThought = useCreateThought();
  const reorderThoughts = useReorderThoughts();

  const handleDelete = (thought: Thought) => {
    deleteThought.mutate({ id: thought.id });
  };

  const handleTitleUpdate = useCallback((thought: Thought, newTitle: string) => {
    updateThought.mutate({ id: thought.id, title: newTitle });
  }, [updateThought]);

  const handleLabelUpdate = useCallback((thought: Thought, labelId: string | null) => {
    updateThought.mutate({ id: thought.id, labelId });
  }, [updateThought]);

  const handleAddThought = useCallback(async () => {
    const trimmed = newThoughtTitle.trim();
    if (!trimmed) return;

    try {
      await createThought.mutateAsync({ title: trimmed });
      setNewThoughtTitle('');
      setIsAddingThought(false);
    } catch (error) {
      console.error('Failed to create thought:', error);
    }
  }, [newThoughtTitle, createThought]);

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddThought();
    } else if (e.key === 'Escape') {
      setNewThoughtTitle('');
      setIsAddingThought(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((thought: Thought) => {
    setDraggedThought(thought);
  }, []);

  const handleDragOver = useCallback((_event: React.DragEvent, thought: Thought) => {
    if (draggedThought && thought.id !== draggedThought.id) {
      setDragOverThought(thought);
    }
  }, [draggedThought]);

  const handleDragEnd = useCallback(() => {
    setDraggedThought(null);
    setDragOverThought(null);
  }, []);

  const handleDrop = useCallback((targetThought: Thought) => {
    if (!draggedThought || draggedThought.id === targetThought.id) {
      handleDragEnd();
      return;
    }

    // Calculate new order
    const currentThoughts = [...thoughts];
    const draggedIndex = currentThoughts.findIndex(t => t.id === draggedThought.id);
    const targetIndex = currentThoughts.findIndex(t => t.id === targetThought.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      handleDragEnd();
      return;
    }

    // Remove dragged item and insert at target position
    const [removed] = currentThoughts.splice(draggedIndex, 1);
    currentThoughts.splice(targetIndex, 0, removed);

    // Get the new ordered IDs
    const orderedIds = currentThoughts.map(t => t.id);

    // Call reorder API
    reorderThoughts.mutate({ orderedIds });

    handleDragEnd();
  }, [draggedThought, thoughts, reorderThoughts, handleDragEnd]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Simple title with icon - fixed */}
      <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary mb-6 tracking-wide flex-shrink-0">
        <Lightbulb size={25} animateOnHover />
        Thoughts
      </h2>

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
        <div className="relative flex-1 min-h-0 overflow-y-auto">
          {/* Vertical connecting line - positioned at center of circle (5.5px from left edge) */}
          {(thoughts.length > 0 || isAddingThought) && (
            <div
              className="absolute left-[5px] top-[10px] w-[1px] bg-border"
              style={{
                height: `calc(100% - ${isAddingThought ? '10px' : '20px'})`
              }}
            />
          )}

          {/* Thoughts list */}
          <div className="space-y-0">
            {thoughts.map((thought) => (
              <ThoughtCard
                key={thought.id}
                thought={thought}
                onDelete={handleDelete}
                onTitleUpdate={handleTitleUpdate}
                onLabelUpdate={handleLabelUpdate}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                isDragOver={dragOverThought?.id === thought.id}
                isDraggable={true}
              />
            ))}
          </div>

          {/* Empty state */}
          {thoughts.length === 0 && !isAddingThought && (
            <p className="text-sm text-text-tertiary py-2">
              No thoughts yet. Capture quick notes here!
            </p>
          )}

          {/* Add new thought */}
          <div className="flex items-center gap-3 group">
            {/* Circle on the line */}
            <div className="relative z-10 w-[11px] h-[11px] rounded-full border border-border bg-white flex-shrink-0" />

            {isAddingThought ? (
              <input
                type="text"
                value={newThoughtTitle}
                onChange={(e) => setNewThoughtTitle(e.target.value)}
                onKeyDown={handleAddKeyDown}
                onBlur={() => {
                  if (!newThoughtTitle.trim()) {
                    setIsAddingThought(false);
                  }
                }}
                placeholder="Type your thought..."
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
                onClick={() => setIsAddingThought(true)}
                className="
                  flex items-center gap-1.5 py-2
                  text-sm text-text-tertiary
                  hover:text-text-secondary
                  transition-colors
                "
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add thought</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export type { ThoughtPanelProps };
