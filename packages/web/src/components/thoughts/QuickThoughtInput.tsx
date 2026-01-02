import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Tag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateThought } from '../../hooks/useThoughts';
import { useLabels, type Label } from '../../hooks/useLabels';
import { LabelBadge } from '../labels/LabelBadge';

interface QuickThoughtInputProps {
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Additional class names */
  className?: string;
  /** Navigate to thought page after creation */
  navigateOnCreate?: boolean;
}

/**
 * QuickThoughtInput Component
 * Rapid thought capture with minimal friction
 * - Input field always visible
 * - Submit on Enter
 * - Optional label picker (collapsed by default)
 * - Optimistic update
 */
export function QuickThoughtInput({
  autoFocus = false,
  placeholder = 'Capture a quick thought...',
  className = '',
  navigateOnCreate = true,
}: QuickThoughtInputProps) {
  const [title, setTitle] = useState('');
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelPickerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: labels = [], isLoading: labelsLoading } = useLabels();
  const createThought = useCreateThought();

  const selectedLabel = labels.find((l) => l.id === selectedLabelId) ?? null;

  // Handle click outside to close label picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        labelPickerRef.current &&
        !labelPickerRef.current.contains(event.target as Node)
      ) {
        setShowLabelPicker(false);
      }
    }

    if (showLabelPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLabelPicker]);

  const handleSubmit = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || createThought.isPending) return;

    try {
      const newThought = await createThought.mutateAsync({
        title: trimmedTitle,
        labelId: selectedLabelId,
      });

      // Reset form
      setTitle('');
      setSelectedLabelId(null);
      setShowLabelPicker(false);

      // Navigate to thought page if enabled
      if (navigateOnCreate && newThought?.id) {
        navigate(`/workspace/thoughts/${newThought.id}`);
      }

      // Refocus input for rapid capture
      inputRef.current?.focus();
    } catch (error) {
      // Error handling is done by the mutation
      console.error('Failed to create thought:', error);
    }
  }, [title, selectedLabelId, createThought, navigateOnCreate, navigate]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleLabelSelect = (label: Label) => {
    setSelectedLabelId(label.id);
    setShowLabelPicker(false);
    inputRef.current?.focus();
  };

  const handleClearLabel = () => {
    setSelectedLabelId(null);
  };

  const isSubmitting = createThought.isPending;
  const hasTitle = title.trim().length > 0;

  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* Main input container */}
        <div
          className={`
            flex items-center gap-2
            bg-white border border-border rounded-lg
            transition-all duration-150
            focus-within:border-wawanesa-blue focus-within:ring-2 focus-within:ring-wawanesa-blue/20
            hover:border-border-hover
            ${isSubmitting ? 'opacity-60' : ''}
          `}
        >
          {/* Label indicator (if selected) */}
          {selectedLabel && (
            <div className="pl-3 flex-shrink-0">
              <LabelBadge
                label={selectedLabel}
                size="sm"
                removable
                onRemove={handleClearLabel}
              />
            </div>
          )}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={200}
            autoFocus={autoFocus}
            disabled={isSubmitting}
            className={`
              flex-1 h-11 bg-transparent
              text-text-primary placeholder:text-text-tertiary
              focus:outline-none
              disabled:cursor-not-allowed
              ${selectedLabel ? 'pl-2' : 'pl-4'}
            `}
            aria-label="Quick thought input"
          />

          {/* Label picker toggle */}
          <button
            type="button"
            onClick={() => setShowLabelPicker(!showLabelPicker)}
            disabled={isSubmitting}
            className={`
              p-2 mr-1 rounded-md
              text-text-tertiary
              transition-colors duration-150
              hover:text-midnight-sky hover:bg-surface-secondary
              focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/30
              disabled:opacity-50 disabled:cursor-not-allowed
              ${showLabelPicker ? 'text-wawanesa-blue bg-wawanesa-blue-light' : ''}
            `}
            aria-label="Add label"
            aria-expanded={showLabelPicker}
          >
            <Tag className="w-4 h-4" />
          </button>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasTitle || isSubmitting}
            className={`
              h-11 px-4 rounded-r-lg
              flex items-center justify-center gap-2
              font-medium text-sm
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-wawanesa-blue/30
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                hasTitle && !isSubmitting
                  ? 'bg-wawanesa-blue text-white hover:bg-wawanesa-blue-hover'
                  : 'bg-surface-secondary text-text-tertiary'
              }
            `}
            aria-label="Create thought"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Label picker dropdown */}
        {showLabelPicker && (
          <div
            ref={labelPickerRef}
            className="
              absolute top-full left-0 right-0 mt-1 z-20
              bg-white border border-border rounded-lg shadow-lg
              max-h-64 overflow-y-auto
            "
          >
            <div className="p-2 border-b border-border">
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                Select Label
              </span>
            </div>

            {labelsLoading ? (
              <div className="flex items-center justify-center py-4 text-text-tertiary">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </div>
            ) : labels.length === 0 ? (
              <div className="py-4 px-3 text-center text-text-tertiary text-sm">
                No labels available
              </div>
            ) : (
              <div className="py-1">
                {/* No label option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLabelId(null);
                    setShowLabelPicker(false);
                    inputRef.current?.focus();
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2
                    text-left text-sm
                    transition-colors
                    ${selectedLabelId === null ? 'bg-surface-secondary' : 'hover:bg-surface-secondary'}
                  `}
                >
                  <span className="w-3 h-3 rounded-full bg-border" />
                  <span className="text-text-secondary">No label</span>
                </button>

                {/* Label options */}
                {labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => handleLabelSelect(label)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2
                      text-left text-sm
                      transition-colors
                      ${selectedLabelId === label.id ? 'bg-wawanesa-blue-light' : 'hover:bg-surface-secondary'}
                    `}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="flex-1 truncate">{label.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Character count hint */}
      {title.length > 150 && (
        <div className="mt-1 text-xs text-text-tertiary text-right">
          {title.length}/200
        </div>
      )}
    </div>
  );
}

export type { QuickThoughtInputProps };
