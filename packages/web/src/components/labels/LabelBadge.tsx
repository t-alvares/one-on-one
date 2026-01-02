import { forwardRef, type HTMLAttributes } from 'react';
import { X } from 'lucide-react';
import type { Label } from '../../hooks/useLabels';

type LabelBadgeSize = 'sm' | 'md';

interface LabelBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** The label to display */
  label: Label;
  /** Size variant */
  size?: LabelBadgeSize;
  /** Show a remove button */
  removable?: boolean;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Make the badge interactive (clickable) */
  interactive?: boolean;
}

const sizeStyles: Record<LabelBadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
};

const removeButtonSizes: Record<LabelBadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

/**
 * Calculate contrasting text color based on background color
 * Returns black or white depending on background luminance
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const lighten = (value: number) => Math.min(255, Math.floor(value + (255 - value) * percent));

  const newR = lighten(r).toString(16).padStart(2, '0');
  const newG = lighten(g).toString(16).padStart(2, '0');
  const newB = lighten(b).toString(16).padStart(2, '0');

  return `#${newR}${newG}${newB}`;
}

/**
 * LabelBadge Component
 * Displays a label as a colored pill with the label name
 */
const LabelBadge = forwardRef<HTMLSpanElement, LabelBadgeProps>(
  (
    {
      label,
      size = 'sm',
      removable = false,
      onRemove,
      interactive = false,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    // Use lighter background with darker text for better readability
    const backgroundColor = lightenColor(label.color, 0.85);
    const textColor = label.color;
    const dotColor = label.color;

    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center
          font-medium rounded-full
          transition-all duration-150
          ${sizeStyles[size]}
          ${interactive ? 'cursor-pointer hover:opacity-80' : ''}
          ${className}
        `}
        style={{
          backgroundColor,
          color: textColor,
        }}
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {/* Color dot */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />

        {/* Label name */}
        <span className="truncate max-w-[120px]">{label.name}</span>

        {/* Remove button */}
        {removable && onRemove && (
          <button
            type="button"
            onClick={handleRemoveClick}
            className={`
              flex-shrink-0 rounded-full
              hover:bg-black/10 transition-colors
              focus:outline-none focus:ring-1 focus:ring-current
              ${removeButtonSizes[size]}
            `}
            aria-label={`Remove ${label.name} label`}
          >
            <X className="w-full h-full" />
          </button>
        )}
      </span>
    );
  }
);

LabelBadge.displayName = 'LabelBadge';

export { LabelBadge, getContrastColor, lightenColor };
export type { LabelBadgeProps, LabelBadgeSize };
