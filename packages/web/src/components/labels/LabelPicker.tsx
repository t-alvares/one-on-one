import { useState, useRef, useEffect, useCallback } from 'react';
import { Tag, ChevronDown, Check, X, Loader2 } from 'lucide-react';
import { useLabels, type Label } from '../../hooks/useLabels';
import { LabelBadge } from './LabelBadge';

interface LabelPickerProps {
  /** Currently selected label ID */
  value?: string | null;
  /** Callback when a label is selected */
  onChange: (labelId: string | null) => void;
  /** Placeholder text when no label selected */
  placeholder?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
}

const sizeStyles = {
  sm: {
    trigger: 'h-8 px-2.5 text-sm',
    dropdown: 'text-sm',
    item: 'px-2.5 py-1.5',
  },
  md: {
    trigger: 'h-10 px-3 text-sm',
    dropdown: 'text-sm',
    item: 'px-3 py-2',
  },
};

/**
 * LabelPicker Component
 * Dropdown for selecting a label from available labels
 */
export function LabelPicker({
  value,
  onChange,
  placeholder = 'Select label...',
  clearable = true,
  disabled = false,
  size = 'md',
  className = '',
}: LabelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: labels = [], isLoading, error } = useLabels();
  const styles = sizeStyles[size];

  // Find selected label
  const selectedLabel = labels.find((l) => l.id === value) ?? null;

  // Filter labels by search query
  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        triggerRef.current?.focus();
      } else if (event.key === 'Enter' && filteredLabels.length === 1) {
        onChange(filteredLabels[0].id);
        setIsOpen(false);
        setSearchQuery('');
      }
    },
    [filteredLabels, onChange]
  );

  const handleSelect = (label: Label) => {
    onChange(label.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (isOpen) {
        setSearchQuery('');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2
          bg-white border border-border rounded-md
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-wawanesa-blue/30 focus:border-wawanesa-blue
          hover:border-border-hover
          disabled:opacity-50 disabled:cursor-not-allowed
          ${styles.trigger}
          ${isOpen ? 'ring-2 ring-wawanesa-blue/30 border-wawanesa-blue' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedLabel ? (
            <LabelBadge label={selectedLabel} size="sm" />
          ) : (
            <>
              <Tag className="w-4 h-4 text-text-tertiary flex-shrink-0" />
              <span className="text-text-tertiary truncate">{placeholder}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {clearable && selectedLabel && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-surface-secondary transition-colors"
              aria-label="Clear label"
            >
              <X className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-text-tertiary transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 w-full mt-1
            bg-white border border-border rounded-md shadow-lg
            max-h-64 overflow-hidden
            ${styles.dropdown}
          `}
          role="listbox"
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          {labels.length > 5 && (
            <div className="p-2 border-b border-border">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search labels..."
                className="
                  w-full px-2.5 py-1.5
                  text-sm bg-surface-secondary border-0 rounded
                  focus:outline-none focus:ring-1 focus:ring-wawanesa-blue
                  placeholder:text-text-tertiary
                "
              />
            </div>
          )}

          {/* Labels list */}
          <div className="overflow-y-auto max-h-48">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-text-tertiary">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading labels...
              </div>
            ) : error ? (
              <div className="py-4 px-3 text-center text-error text-sm">
                Failed to load labels
              </div>
            ) : filteredLabels.length === 0 ? (
              <div className="py-4 px-3 text-center text-text-tertiary text-sm">
                {searchQuery ? 'No labels match your search' : 'No labels available'}
              </div>
            ) : (
              filteredLabels.map((label) => {
                const isSelected = label.id === value;

                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => handleSelect(label)}
                    className={`
                      w-full flex items-center gap-2
                      text-left transition-colors
                      ${styles.item}
                      ${isSelected ? 'bg-wawanesa-blue-light' : 'hover:bg-surface-secondary'}
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {/* Color dot */}
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                      style={{ backgroundColor: label.color }}
                    />

                    {/* Label name */}
                    <span className="flex-1 truncate">{label.name}</span>

                    {/* Selected indicator */}
                    {isSelected && (
                      <Check className="w-4 h-4 text-wawanesa-blue flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export type { LabelPickerProps };
