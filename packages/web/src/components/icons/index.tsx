/**
 * Icon Library
 *
 * Centralized icon exports for consistent usage across the application.
 * Each section of the app has a designated animated icon from animate-ui.
 *
 * Usage:
 *   import { ThoughtsIcon, TopicsIcon, MeetingsIcon, DeleteIcon } from '@/components/icons';
 *
 *   <ThoughtsIcon size={25} animateOnHover />
 *   <TopicsIcon size={25} animateOnHover />
 *   <MeetingsIcon size={25} animateOnHover />
 *   <DeleteIcon size={16} animateOnHover />
 */

// Section Icons (animated)
export { Lightbulb as ThoughtsIcon } from '@/components/animate-ui/icons/lightbulb';
export { ClipboardCheck as TopicsIcon } from '@/components/animate-ui/icons/clipboard-check';
export { Users as MeetingsIcon } from '@/components/animate-ui/icons/users';
export { UserRound as PositionTypeIcon } from '@/components/animate-ui/icons/user-round';

// Action Icons (animated)
export { Trash2 as DeleteIcon } from '@/components/animate-ui/icons/trash-2';
export { Sparkles as PromoteIcon } from '@/components/animate-ui/icons/sparkles';

// Navigation Icons (animated)
export { MoveLeft as BackIcon } from '@/components/animate-ui/icons/move-left';

// Re-export types for convenience
export type { LightbulbProps as ThoughtsIconProps } from '@/components/animate-ui/icons/lightbulb';
export type { ClipboardCheckProps as TopicsIconProps } from '@/components/animate-ui/icons/clipboard-check';
export type { UsersProps as MeetingsIconProps } from '@/components/animate-ui/icons/users';
export type { UserRoundProps as PositionTypeIconProps } from '@/components/animate-ui/icons/user-round';
export type { Trash2Props as DeleteIconProps } from '@/components/animate-ui/icons/trash-2';
export type { SparklesProps as PromoteIconProps } from '@/components/animate-ui/icons/sparkles';
export type { MoveLeftProps as BackIconProps } from '@/components/animate-ui/icons/move-left';

// Standard sizes used across the app
export const ICON_SIZES = {
  /** Section headers in workspace panels */
  sectionHeader: 25,
  /** Modal titles and smaller contexts */
  modal: 22,
  /** Inline with text */
  inline: 18,
  /** Small indicators */
  small: 16,
} as const;

/**
 * Icon Usage Guide:
 *
 * Section Icons:
 * | Section      | Icon           | Import                    |
 * |--------------|----------------|---------------------------|
 * | Thoughts     | Lightbulb      | ThoughtsIcon              |
 * | Topics       | ClipboardCheck | TopicsIcon                |
 * | Meetings     | Users          | MeetingsIcon              |
 *
 * Action Icons:
 * | Action       | Icon           | Import                    |
 * |--------------|----------------|---------------------------|
 * | Delete       | Trash2         | DeleteIcon                |
 * | Promote      | Sparkles       | PromoteIcon               |
 * | Back/Return  | MoveLeft       | BackIcon                  |
 *
 * Standard Props:
 * - size={25} for section headers
 * - size={22} for modal titles
 * - size={16} for button icons
 * - animateOnHover for standalone icons (headers, spans)
 * - animate={boolean} for icons inside buttons (controlled by parent hover)
 *
 * IMPORTANT: Animated icons inside Button components
 * --------------------------------------------------
 * The Button component blocks pointer events on SVG children, so `animateOnHover`
 * won't work inside buttons. Instead, use state to control the animation:
 *
 * ```tsx
 * const [isHovered, setIsHovered] = useState(false);
 *
 * <Button
 *   onMouseEnter={() => setIsHovered(true)}
 *   onMouseLeave={() => setIsHovered(false)}
 * >
 *   <DeleteIcon size={16} animate={isHovered} />
 *   Delete
 * </Button>
 * ```
 *
 * Example:
 * ```tsx
 * import { ThoughtsIcon, TopicsIcon, DeleteIcon, ICON_SIZES } from '@/components/icons';
 *
 * // Section header (standalone - use animateOnHover)
 * <ThoughtsIcon size={ICON_SIZES.sectionHeader} animateOnHover />
 *
 * // Modal title (standalone - use animateOnHover)
 * <ThoughtsIcon size={ICON_SIZES.modal} animateOnHover />
 *
 * // Inside Button (use animate with hover state)
 * const [isHovered, setIsHovered] = useState(false);
 * <Button
 *   onMouseEnter={() => setIsHovered(true)}
 *   onMouseLeave={() => setIsHovered(false)}
 * >
 *   <DeleteIcon size={ICON_SIZES.small} animate={isHovered} />
 * </Button>
 * ```
 */
