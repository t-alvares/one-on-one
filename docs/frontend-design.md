# Frontend Design Skill: 1:1 Companion

This project follows Wawanesa brand guidelines with a Notion-inspired UX approach. Reference this skill for all UI implementation.

## Design Direction

**Brand**: Wawanesa Insurance
**Aesthetic**: Clean, professional productivity tool with brand colors
- White backgrounds for cleanliness and clarity
- Wawanesa Blue (#017ACD) for titles and primary actions
- Secondary colors (Orange, Green, Gold, Midnight Sky) for visual hierarchy
- Typography-driven hierarchy
- Subtle depth through shadows
- Purposeful micro-interactions

**Tone**: Professional, trustworthy, approachable — reflecting Wawanesa's brand values

## Typography

### Font Choices
- **Headings**: Use a distinctive sans-serif (e.g., `Sora`, `Cabinet Grotesk`, `Plus Jakarta Sans`)
- **Body**: Clean, highly readable sans-serif (e.g., `DM Sans`, `Plus Jakarta Sans`, `Satoshi`)
- **Monospace** (for labels/tags): `JetBrains Mono` or `Fira Code`

**DO NOT USE**: Inter, Roboto, Arial, system fonts, or generic defaults

### Scale
```css
--text-xs: 0.75rem;    /* 12px - labels, meta */
--text-sm: 0.875rem;   /* 14px - secondary text */
--text-base: 1rem;     /* 16px - body */
--text-lg: 1.125rem;   /* 18px - emphasis */
--text-xl: 1.25rem;    /* 20px - section headers */
--text-2xl: 1.5rem;    /* 24px - page titles */
--text-3xl: 1.875rem;  /* 30px - hero text */
```

## Color Palette — Wawanesa Brand

### Brand Colors Reference
```css
/* PRIMARY */
--wawanesa-blue: #017ACD;       /* Brand Blue - titles, primary actions */
--rich-black: #000000;          /* Rich Black - text */
--white: #FFFFFF;               /* White - backgrounds */

/* SECONDARY */
--wheatfield-orange: #D14905;   /* Orange - alerts, important highlights */
--midnight-sky: #003A5C;        /* Dark Blue - headers, footers, depth */
--grassy-green: #225935;        /* Green - success states */
--prairie-gold: #FFD000;        /* Gold - highlights, badges, notifications */
```

### Light Theme (Primary)
```css
/* Backgrounds */
--bg-primary: #FFFFFF;       /* Main background - White */
--bg-secondary: #FFFFFF;     /* Cards, panels - White */
--bg-tertiary: #F8FAFC;      /* Hover states, inputs - very light gray */
--bg-elevated: #FFFFFF;      /* Modals, dropdowns - White */

/* Text */
--text-primary: #000000;     /* Headings, primary - Rich Black */
--text-secondary: #003A5C;   /* Body text - Midnight Sky */
--text-tertiary: #6B7280;    /* Muted, placeholders */
--text-heading: #017ACD;     /* Titles, section headers - Wawanesa Blue */

/* Borders */
--border-light: #E5E7EB;     /* Subtle dividers */
--border-medium: #D1D5DB;    /* Input borders */
--border-focus: #017ACD;     /* Focus states - Wawanesa Blue */

/* Accents */
--accent-primary: #017ACD;   /* Primary actions - Wawanesa Blue */
--accent-success: #225935;   /* Success, done - Grassy Green */
--accent-warning: #D14905;   /* Warnings, attention - Wheatfield Orange */
--accent-error: #D14905;     /* Errors, destructive - Wheatfield Orange */
--accent-highlight: #FFD000; /* Badges, notifications - Prairie Gold */

/* Interactive */
--hover-overlay: rgba(1, 122, 205, 0.08);   /* Wawanesa Blue tint */
--active-overlay: rgba(1, 122, 205, 0.12);  /* Wawanesa Blue tint */

/* Cards & Modals - use secondary colors for visual interest */
--card-border: #E5E7EB;
--card-header-bg: #003A5C;      /* Midnight Sky for card headers */
--modal-header-bg: #017ACD;     /* Wawanesa Blue for modal headers */
```

### Category/Label Colors (Using Brand Palette)
```css
--label-development: #003A5C;   /* Midnight Sky */
--label-feedback: #D14905;      /* Wheatfield Orange */
--label-career: #225935;        /* Grassy Green */
--label-project: #017ACD;       /* Wawanesa Blue */
--label-team: #FFD000;          /* Prairie Gold */
--label-personal: #003A5C;      /* Midnight Sky */
```

### Status Colors
```css
--status-not-started: #6B7280;  /* Gray */
--status-in-progress: #017ACD;  /* Wawanesa Blue */
--status-completed: #225935;    /* Grassy Green */
--status-blocked: #D14905;      /* Wheatfield Orange */
```

## Spacing System

Follow 4px base unit:
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

**Key principle**: Generous whitespace. When in doubt, add more space.

## Shadows & Depth

```css
/* Subtle elevation */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);

/* Cards, panels */
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);

/* Modals, dropdowns */
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);

/* Drag states */
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
```

## Border Radius

```css
--radius-sm: 4px;     /* Buttons, inputs */
--radius-md: 8px;     /* Cards, panels */
--radius-lg: 12px;    /* Modals, larger elements */
--radius-xl: 16px;    /* Feature cards */
--radius-full: 9999px; /* Pills, avatars */
```

## Component Patterns

### Cards (Wawanesa Style)
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);
}

.card:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-md);
}

/* Card with colored header (use for important cards) */
.card-featured {
  border-top: 3px solid var(--wheatfield-orange);  /* Orange top accent */
}

/* Card with orange left accent (for attention-grabbing items) */
.card-accent {
  border-left: 4px solid var(--wheatfield-orange);
}

.card-header {
  background: var(--midnight-sky);
  color: white;
  padding: var(--space-3) var(--space-4);
  margin: calc(var(--space-4) * -1);
  margin-bottom: var(--space-4);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

/* Orange header variant for important/urgent cards */
.card-header-urgent {
  background: var(--wheatfield-orange);
  color: white;
}
```

### Thought Card (with orange accent on hover)
```css
.thought-card {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  transition: all 0.15s ease;
}

.thought-card:hover {
  border-left: 3px solid var(--wheatfield-orange);
  padding-left: calc(var(--space-3) - 2px);
}
```

### Topic Card (draggable with orange drag indicator)
```css
.topic-card {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  cursor: grab;
}

.topic-card .drag-handle {
  color: var(--text-tertiary);
  transition: color 0.15s ease;
}

.topic-card:hover .drag-handle {
  color: var(--wheatfield-orange);
}

.topic-card.dragging {
  border-color: var(--wheatfield-orange);
  box-shadow: 0 8px 24px rgba(209, 73, 5, 0.15);
}
```

### Modal (Wawanesa Style)
```css
.modal {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  background: var(--wawanesa-blue);
  color: white;
  padding: var(--space-4) var(--space-6);
}

.modal-header h2 {
  color: white;
  margin: 0;
}

.modal-body {
  padding: var(--space-6);
  background: var(--white);
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-light);
}
```

### Headings & Titles
```css
h1, h2, h3, .title {
  color: var(--wawanesa-blue);
  font-family: var(--font-display);
}

.page-title {
  color: var(--wawanesa-blue);
  font-size: var(--text-2xl);
  font-weight: 600;
}

.section-title {
  color: var(--wawanesa-blue);
  font-size: var(--text-lg);
  font-weight: 600;
  border-bottom: 2px solid var(--wheatfield-orange);  /* Orange underline */
  padding-bottom: var(--space-2);
  display: inline-block;
}

/* Accent title variation with orange */
.section-title-accent {
  color: var(--wawanesa-blue);
  font-size: var(--text-lg);
  font-weight: 600;
}

.section-title-accent::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1em;
  background: var(--wheatfield-orange);
  margin-right: var(--space-2);
  vertical-align: middle;
}
```

### Buttons (Secondary Colors)
```css
/* Primary button - Midnight Sky (dark blue for strong contrast on white) */
.btn-primary {
  background: var(--midnight-sky);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: #002D47;  /* Darker shade of Midnight Sky */
  transform: translateY(-1px);
}

/* Secondary button - Grassy Green */
.btn-secondary {
  background: var(--grassy-green);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #1A4528;  /* Darker shade of Grassy Green */
  transform: translateY(-1px);
}

/* Accent button - Wheatfield Orange (for important actions) */
.btn-accent {
  background: var(--wheatfield-orange);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-accent:hover {
  background: #B33D04;  /* Darker shade of Orange */
  transform: translateY(-1px);
}

/* Highlight button - Prairie Gold (for special actions) */
.btn-highlight {
  background: var(--prairie-gold);
  color: var(--rich-black);
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-highlight:hover {
  background: #E6BC00;  /* Darker shade of Gold */
  transform: translateY(-1px);
}

/* Ghost/Outline button - for less prominent actions */
.btn-ghost {
  background: transparent;
  color: var(--midnight-sky);
  border: 1px solid var(--midnight-sky);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-ghost:hover {
  background: rgba(0, 58, 92, 0.08);
}

/* Danger/Delete button - Wheatfield Orange */
.btn-danger {
  background: var(--wheatfield-orange);
  color: white;
}

/* Button usage guide:
 * - Primary (Midnight Sky): Main actions like "Save", "Create", "Submit"
 * - Secondary (Grassy Green): Positive actions like "Confirm", "Complete", "Done"
 * - Accent (Orange): Important/urgent actions, "End Meeting"
 * - Highlight (Gold): Special actions, promotional CTAs
 * - Ghost: Cancel, Back, secondary options
 * - Danger (Orange): Delete, Remove actions
 */
```

### Badges & Labels
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

/* Using brand colors for badges */
.badge-primary {
  background: var(--wawanesa-blue);
  color: white;
}

.badge-success {
  background: var(--grassy-green);
  color: white;
}

.badge-warning {
  background: var(--wheatfield-orange);
  color: white;
}

.badge-highlight {
  background: var(--prairie-gold);
  color: var(--rich-black);
}

.badge-info {
  background: var(--midnight-sky);
  color: white;
}

/* Subtle/outline variants */
.badge-subtle {
  background: rgba(1, 122, 205, 0.1);
  color: var(--wawanesa-blue);
}
```

### Notification Badge (Prairie Gold highlight)
```css
.notification-badge {
  background: var(--prairie-gold);
  color: var(--rich-black);
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
}
```

### Draggable Items
```css
.draggable {
  cursor: grab;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.draggable:active {
  cursor: grabbing;
}

.dragging {
  transform: rotate(2deg) scale(1.02);
  box-shadow: var(--shadow-xl);
  opacity: 0.95;
  border-color: var(--wawanesa-blue);
}

.drop-target {
  background: rgba(1, 122, 205, 0.1);
  border: 2px dashed var(--wawanesa-blue);
}
```

### Sidebar Navigation
```css
.sidebar {
  background: var(--white);
  border-right: 1px solid var(--border-light);
}

.sidebar-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-light);
}

.sidebar-logo {
  color: var(--wawanesa-blue);
  font-weight: 700;
  font-size: var(--text-lg);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: var(--hover-overlay);
  color: var(--midnight-sky);
}

.nav-item.active {
  background: rgba(0, 58, 92, 0.1);
  color: var(--midnight-sky);
  font-weight: 500;
  border-left: 3px solid var(--wheatfield-orange);  /* Orange active indicator */
}

/* Team member with pending items - orange dot */
.nav-item .indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--wheatfield-orange);
}

/* Team member with urgent items - pulsing orange */
.nav-item .indicator-urgent {
  background: var(--wheatfield-orange);
  animation: pulse-orange 2s infinite;
}

@keyframes pulse-orange {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Input Fields
```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--white);
  font-size: var(--text-base);
  transition: all 0.15s ease;
}

.input:hover {
  border-color: var(--border-medium);
}

.input:focus {
  outline: none;
  border-color: var(--wawanesa-blue);
  box-shadow: 0 0 0 3px rgba(1, 122, 205, 0.15);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### Alert Messages
```css
.alert {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border-left: 4px solid;
}

.alert-info {
  background: rgba(1, 122, 205, 0.1);
  border-left-color: var(--wawanesa-blue);
  color: var(--midnight-sky);
}

.alert-success {
  background: rgba(34, 89, 53, 0.1);
  border-left-color: var(--grassy-green);
  color: var(--grassy-green);
}

.alert-warning {
  background: rgba(209, 73, 5, 0.1);
  border-left-color: var(--wheatfield-orange);
  color: var(--wheatfield-orange);
}

.alert-highlight {
  background: rgba(255, 208, 0, 0.2);
  border-left-color: var(--prairie-gold);
  color: var(--rich-black);
}
```

### Meeting Cards (with brand colors)
```css
.meeting-card {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.15s ease;
}

.meeting-card:hover {
  box-shadow: var(--shadow-md);
}

.meeting-card-header {
  background: var(--midnight-sky);
  color: white;
  padding: var(--space-2) var(--space-3);
  font-weight: 500;
}

.meeting-card.upcoming .meeting-card-header {
  background: var(--grassy-green);
}

/* Next immediate meeting - highlighted with orange */
.meeting-card.next .meeting-card-header {
  background: var(--wheatfield-orange);
}

.meeting-card.past .meeting-card-header {
  background: var(--midnight-sky);
  opacity: 0.8;
}

.meeting-card-body {
  padding: var(--space-3);
}

/* Topic indicator in meeting card */
.topic-indicator-mine {
  color: var(--grassy-green);
}

.topic-indicator-theirs {
  color: var(--wheatfield-orange);  /* Orange for topics added by other party */
}

/* New topics badge */
.meeting-card .new-topics-badge {
  background: var(--wheatfield-orange);
  color: white;
  font-size: var(--text-xs);
  padding: 2px 6px;
  border-radius: var(--radius-full);
}
```

### Action Cards
```css
.action-card {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  transition: all 0.15s ease;
}

.action-card:hover {
  box-shadow: var(--shadow-md);
}

/* Overdue action - orange warning */
.action-card.overdue {
  border-left: 4px solid var(--wheatfield-orange);
}

.action-card.overdue .due-date {
  color: var(--wheatfield-orange);
  font-weight: 500;
}

/* Action needs attention indicator */
.action-card .attention-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--wheatfield-orange);
  display: inline-block;
}
```

### Action Status Pills
```css
.status-pill {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.status-not-started {
  background: #F3F4F6;
  color: #6B7280;
}

.status-in-progress {
  background: rgba(1, 122, 205, 0.15);
  color: var(--wawanesa-blue);
}

.status-completed {
  background: rgba(34, 89, 53, 0.15);
  color: var(--grassy-green);
}

.status-blocked {
  background: rgba(209, 73, 5, 0.15);
  color: var(--wheatfield-orange);
}
```

## Animations & Transitions

### Base Timing
```css
--duration-fast: 100ms;
--duration-normal: 150ms;
--duration-slow: 300ms;
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Micro-interactions
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(8px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Scale in (for modals) */
@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}

/* Stagger children */
.stagger-list > * {
  animation: slideUp 0.3s var(--ease-default) backwards;
}

.stagger-list > *:nth-child(1) { animation-delay: 0ms; }
.stagger-list > *:nth-child(2) { animation-delay: 50ms; }
.stagger-list > *:nth-child(3) { animation-delay: 100ms; }
/* ... continue pattern */
```

### Button Interactions
```css
.btn {
  transition: all var(--duration-normal) var(--ease-default);
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}
```

## Layout Patterns

### Sidebar + Content
```css
.app-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-light);
  padding: var(--space-4);
}

.main-content {
  background: var(--bg-primary);
  padding: var(--space-8);
  overflow-y: auto;
}
```

### Three-Column Workspace (Thoughts | Topics | Meetings)
```css
.workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  gap: var(--space-6);
  height: calc(100vh - 120px);
}

.thoughts-panel { grid-area: 1 / 1 / 2 / 2; }
.topics-panel { grid-area: 1 / 2 / 2 / 3; }
.meetings-panel { grid-area: 2 / 1 / 3 / 3; }
```

## Icons

Use **Lucide React** for consistent iconography:
```tsx
import { 
  MessageSquare,  // Thoughts
  Target,         // Topics
  Calendar,       // Meetings
  Zap,            // Actions
  User,           // IC
  Users,          // Leader/Team
  Settings,       // Admin
  Plus,           // Add
  GripVertical,   // Drag handle
  Check,          // Done
  ArrowRight,     // Move/Next
  Tag,            // Labels
} from 'lucide-react';
```

Icon sizing:
```css
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
```

## Anti-Patterns (DO NOT DO)

❌ Using Blue Tint (#CCEBFF) or Dark Grey (#53565A) from the brand palette
❌ Heavy borders everywhere
❌ Bright, saturated colors for large areas
❌ Generic system fonts
❌ Cluttered interfaces with no breathing room
❌ Off-brand color schemes
❌ Excessive animations that slow down interaction
❌ Cookie-cutter component library aesthetics
❌ Inconsistent spacing and alignment
❌ Tiny, hard-to-click targets
❌ Backgrounds other than white for main content areas

## Inspiration Reference

Look to these for aesthetic guidance:
- **Notion** — Block-based, clean, typographic hierarchy
- **Linear** — Keyboard-first, smooth animations
- **Craft** — Document elegance, beautiful typography
- **Wawanesa.com** — Brand consistency, professional tone

## Brand Color Quick Reference

| Use Case | Color | Hex |
|----------|-------|-----|
| **Page background** | White | `#FFFFFF` |
| **Titles & headings** | Wawanesa Blue | `#017ACD` |
| **Body text** | Rich Black | `#000000` |
| **Secondary text** | Midnight Sky | `#003A5C` |
| **Primary buttons** | Midnight Sky | `#003A5C` |
| **Secondary buttons** | Grassy Green | `#225935` |
| **Accent/CTA buttons** | Wheatfield Orange | `#D14905` |
| **Highlight buttons** | Prairie Gold | `#FFD000` |
| **Card headers** | Midnight Sky | `#003A5C` |
| **Modal headers** | Wawanesa Blue | `#017ACD` |
| **Active nav indicator** | Wheatfield Orange | `#D14905` |
| **Section title underline** | Wheatfield Orange | `#D14905` |
| **Topics from others** | Wheatfield Orange | `#D14905` |
| **Overdue/urgent items** | Wheatfield Orange | `#D14905` |
| **Drag handles (hover)** | Wheatfield Orange | `#D14905` |
| **Pending indicators** | Wheatfield Orange | `#D14905` |
| **Next meeting header** | Wheatfield Orange | `#D14905` |
| **Success states** | Grassy Green | `#225935` |
| **Highlights/badges** | Prairie Gold | `#FFD000` |
| **Links & focus** | Wawanesa Blue | `#017ACD` |
| **Hover states** | Midnight Sky @ 8% | `rgba(0,58,92,0.08)` |

## Wheatfield Orange Usage Summary

Use **Wheatfield Orange (#D14905)** for:
- Active navigation indicators (left border)
- Section title underlines
- Topics added by the other party (👥)
- Overdue actions and urgent items
- Drag handle hover states
- "End Meeting" and important action buttons
- Next immediate meeting card header
- Notification dots for pending items
- Featured card top borders
- Alert/warning states

## Implementation Notes

1. Always use CSS custom properties for theming
2. Build mobile-first, then enhance for desktop
3. Test all interactive states: hover, focus, active, disabled
4. Ensure keyboard navigation works everywhere
5. Use `prefers-reduced-motion` for accessibility
6. Lazy-load heavy animations
7. Keep bundle size in mind — prefer CSS over JS animation

---

## Block Editor (Notion-like)

The app uses a Notion-style block editor for Thoughts, Topics, Meeting Notes, and Action descriptions. Built with **Tiptap** (ProseMirror-based).

### Editor Container
```css
.block-editor {
  background: var(--white);
  min-height: 200px;
  padding: var(--space-4);
}

.block-editor:focus-within {
  outline: none;
}

.block-editor .ProseMirror {
  outline: none;
  min-height: 150px;
}

.block-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--text-tertiary);
  pointer-events: none;
  float: left;
  height: 0;
}
```

### Block Types

```css
/* Headings */
.block-editor h1 {
  color: var(--wawanesa-blue);
  font-size: var(--text-2xl);
  font-weight: 700;
  margin: var(--space-6) 0 var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--wheatfield-orange);
}

.block-editor h2 {
  color: var(--wawanesa-blue);
  font-size: var(--text-xl);
  font-weight: 600;
  margin: var(--space-5) 0 var(--space-2);
}

.block-editor h3 {
  color: var(--midnight-sky);
  font-size: var(--text-lg);
  font-weight: 600;
  margin: var(--space-4) 0 var(--space-2);
}

/* Paragraph */
.block-editor p {
  color: var(--text-primary);
  line-height: 1.7;
  margin: var(--space-2) 0;
}

/* Blockquote */
.block-editor blockquote {
  border-left: 4px solid var(--wheatfield-orange);
  padding-left: var(--space-4);
  margin: var(--space-4) 0;
  color: var(--text-secondary);
  font-style: italic;
  background: rgba(209, 73, 5, 0.05);
  padding: var(--space-3) var(--space-4);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

/* Lists */
.block-editor ul,
.block-editor ol {
  padding-left: var(--space-6);
  margin: var(--space-3) 0;
}

.block-editor li {
  margin: var(--space-1) 0;
  line-height: 1.6;
}

.block-editor ul li::marker {
  color: var(--wheatfield-orange);
}

.block-editor ol li::marker {
  color: var(--midnight-sky);
  font-weight: 600;
}

/* Checklist / Todo */
.block-editor .checklist-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin: var(--space-2) 0;
}

.block-editor .checklist-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  accent-color: var(--grassy-green);
  cursor: pointer;
}

.block-editor .checklist-item.checked span {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

/* Code Block */
.block-editor pre {
  background: var(--midnight-sky);
  color: #E5E7EB;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--text-sm);
  margin: var(--space-4) 0;
}

.block-editor code {
  background: rgba(0, 58, 92, 0.1);
  color: var(--midnight-sky);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
}

.block-editor pre code {
  background: none;
  color: inherit;
  padding: 0;
}

/* Divider */
.block-editor hr {
  border: none;
  border-top: 2px solid var(--border-light);
  margin: var(--space-6) 0;
}

/* Links */
.block-editor a {
  color: var(--wawanesa-blue);
  text-decoration: underline;
  text-decoration-color: rgba(1, 122, 205, 0.3);
  text-underline-offset: 2px;
  transition: all 0.15s ease;
}

.block-editor a:hover {
  text-decoration-color: var(--wawanesa-blue);
}

/* Callout Box */
.block-editor .callout {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin: var(--space-4) 0;
}

.block-editor .callout-info {
  background: rgba(1, 122, 205, 0.1);
  border-left: 4px solid var(--wawanesa-blue);
}

.block-editor .callout-warning {
  background: rgba(209, 73, 5, 0.1);
  border-left: 4px solid var(--wheatfield-orange);
}

.block-editor .callout-success {
  background: rgba(34, 89, 53, 0.1);
  border-left: 4px solid var(--grassy-green);
}

.block-editor .callout-highlight {
  background: rgba(255, 208, 0, 0.15);
  border-left: 4px solid var(--prairie-gold);
}

/* Images */
.block-editor .image-block {
  margin: var(--space-4) 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.block-editor .image-block img {
  max-width: 100%;
  height: auto;
  display: block;
}

.block-editor .image-block figcaption {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  text-align: center;
}

/* File Attachment */
.block-editor .file-block {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  margin: var(--space-3) 0;
}

.block-editor .file-block:hover {
  border-color: var(--wawanesa-blue);
}

.block-editor .file-block .file-icon {
  color: var(--wheatfield-orange);
  font-size: var(--text-xl);
}
```

### Slash Command Menu
```css
.slash-command-menu {
  position: absolute;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  width: 280px;
  max-height: 350px;
  overflow-y: auto;
  z-index: 50;
}

.slash-command-menu-header {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-tertiary);
}

.slash-command-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background 0.1s ease;
}

.slash-command-item:hover,
.slash-command-item.selected {
  background: rgba(1, 122, 205, 0.08);
}

.slash-command-item .icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--midnight-sky);
  font-size: var(--text-sm);
}

.slash-command-item .label {
  font-weight: 500;
  color: var(--text-primary);
}

.slash-command-item .description {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Keyboard hint */
.slash-command-footer {
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--border-light);
  background: var(--bg-tertiary);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.slash-command-footer kbd {
  background: var(--white);
  border: 1px solid var(--border-medium);
  border-radius: 3px;
  padding: 1px 4px;
  font-family: inherit;
  font-size: var(--text-xs);
}
```

### Inline Formatting Toolbar
```css
.formatting-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1);
  background: var(--midnight-sky);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.formatting-toolbar button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  cursor: pointer;
  transition: background 0.1s ease;
}

.formatting-toolbar button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.formatting-toolbar button.active {
  background: var(--wheatfield-orange);
}

.formatting-toolbar .divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 var(--space-1);
}
```

### Slash Commands Reference

| Command | Block Type | Description |
|---------|------------|-------------|
| `/text` | Paragraph | Plain text block |
| `/h1` | Heading 1 | Large section heading |
| `/h2` | Heading 2 | Medium heading |
| `/h3` | Heading 3 | Small heading |
| `/bullet` | Bulleted List | Unordered list |
| `/number` | Numbered List | Ordered list |
| `/todo` | Checklist | Checkbox items |
| `/quote` | Blockquote | Quote with orange accent |
| `/divider` | Divider | Horizontal line |
| `/code` | Code Block | Syntax highlighted code |
| `/callout` | Callout | Highlighted info box |
| `/image` | Image | Upload or paste image |
| `/file` | File | Attach a file |
| `/link` | Link | Insert hyperlink |

### Inline Formatting (Selection)

| Shortcut | Format |
|----------|--------|
| `Ctrl/⌘ + B` | **Bold** |
| `Ctrl/⌘ + I` | *Italic* |
| `Ctrl/⌘ + U` | <u>Underline</u> |
| `Ctrl/⌘ + K` | Link |
| `Ctrl/⌘ + E` | `Inline code` |
| `Ctrl/⌘ + Shift + S` | ~~Strikethrough~~ |
