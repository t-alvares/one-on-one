# Claude Code Prompts - Build Sequence (Part 1)

This document contains prompts to build the 1:1 Companion app. Copy each prompt to Claude Code and wait for completion before moving to the next.

**See also**: `PROMPTS-PART2.md` for Phases 5-8

---

## Build Phases Overview

| Phase | Focus | Prompts |
|-------|-------|---------|
| **Phase 1** | Project Setup & Infrastructure | 1.1 - 1.4 |
| **Phase 2** | Authentication & Core Backend | 2.1 - 2.4 |
| **Phase 3** | Block Editor Component | 3.1 - 3.2 |
| **Phase 4** | IC Portal | 4.1 - 4.8 |
| **Phase 5** | Leader Portal | 5.1 - 5.4 *(Part 2)* |
| **Phase 6** | Admin Portal | 6.1 - 6.6 *(Part 2)* |
| **Phase 7** | Landing Page & Polish | 7.1 - 7.3 *(Part 2)* |
| **Phase 8** | Testing & Deployment | 8.1 - 8.2 *(Part 2)* |

---

# PHASE 1: Project Setup & Infrastructure

## Prompt 1.1 - Initialize Monorepo Structure - ✅

```
I'm building a 1:1 Companion app for managing one-on-one meetings between Leaders and Individual Contributors. All specifications are in /docs/.

Please read these files first:
- /docs/OVERVIEW.md (product vision)
- /docs/DECISIONS.md (technical decisions)

Then initialize the monorepo structure:

1. Create /api directory:
   - Node.js + Express + TypeScript
   - Set up tsconfig.json with strict mode
   - Create src/ folder structure: routes/, services/, middleware/, types/
   - Add package.json with scripts: dev, build, start
   - Use nodemon for development
   - Port 3001

2. Create /web directory:
   - React 18 + TypeScript + Vite
   - Set up TailwindCSS with the custom colors from /.claude/skills/frontend-design.md
   - Create src/ folder structure: components/, pages/, hooks/, services/, types/
   - Add React Router v6
   - Port 5173

3. Create root package.json with workspaces

4. Create .gitignore for both Node and React

5. Create a basic .env.example for both /api and /web

Do not implement any features yet - just the scaffolding and configuration.
```

---

## Prompt 1.2 - Database Setup with Prisma ✅

```
Continue building the 1:1 Companion app.

Please read /docs/DATA_MODEL.md completely, then:

1. Initialize Prisma in /api:
   - Use SQLite for development (with notes for PostgreSQL migration)
   - Create prisma/schema.prisma with ALL models from DATA_MODEL.md:
     * User (with IC profile fields: position, yearsOfService, timeInPosition, etc.)
     * Relationship
     * Thought (with title + Json content for block editor)
     * Topic (with title + Json content for block editor)
     * Label
     * Meeting
     * MeetingTopic
     * MeetingNote (with Json content)
     * Action (with Json description)
     * ProgressUpdate
     * Competency
     * Notification
     * FileUpload
   - Include all enums: Role, TopicStatus, MeetingStatus, ActionStatus, etc.
   - Add all indexes as specified

2. Run prisma migrate dev to create the database

3. Create a seed file (prisma/seed.ts) with:
   - 1 Admin user
   - 2 Leader users
   - 4 IC users (2 per leader)
   - Sample labels (Career, Development, Feedback, Projects, Personal)
   - Sample competencies (5-6 leadership competencies)
   - Relationships between leaders and ICs
   - A few sample meetings, thoughts, topics

4. Add seed script to package.json

Make sure all the relationships and foreign keys match DATA_MODEL.md exactly.
```

---

## Prompt 1.3 - API Foundation & Middleware ✅

```
Continue building the 1:1 Companion app.

Set up the Express API foundation in /api:

1. Create src/index.ts:
   - Express app with JSON parsing
   - CORS configuration (allow localhost:5173)
   - Error handling middleware
   - Request logging (morgan)
   - Health check endpoint: GET /api/health

2. Create src/middleware/auth.ts:
   - JWT verification middleware
   - Extract user from token and attach to req.user
   - Handle expired/invalid tokens gracefully

3. Create src/middleware/validation.ts:
   - Zod schema validation middleware
   - Return structured error responses

4. Create src/middleware/errorHandler.ts:
   - Global error handler
   - Structured error response format from API_SPEC.md

5. Create src/types/express.d.ts:
   - Extend Express Request to include user property

6. Create src/lib/prisma.ts:
   - Prisma client singleton

7. Create src/lib/password.ts:
   - Password hashing with bcrypt
   - Password verification

8. Create src/lib/jwt.ts:
   - JWT sign function
   - JWT verify function
   - Token expiry: 7 days

Test the health check endpoint works.
```

---

## Prompt 1.4 - Frontend Foundation & Routing ✅

```
Continue building the 1:1 Companion app.

Please read /.claude/skills/frontend-design.md for the design system, then set up the React frontend foundation in /web:

1. Configure TailwindCSS (tailwind.config.js):
   - Add ALL Wawanesa brand colors as CSS variables:
     * wawanesa-blue: #017ACD
     * rich-black: #000000
     * white: #FFFFFF
     * midnight-sky: #003A5C
     * wheatfield-orange: #D14905
     * grassy-green: #225935
     * prairie-gold: #FFD000
   - Add custom spacing, border-radius, shadows from design system
   - Configure font family (Inter)

2. Create src/index.css with:
   - CSS custom properties for all colors
   - Base typography styles
   - Smooth scrolling

3. Create src/App.tsx with React Router:
   - Public routes: /login, / (landing)
   - Protected routes wrapper
   - IC routes: /workspace
   - Leader routes: /team, /team/:icId
   - Admin routes: /admin/*
   - Meeting route: /meetings/:id
   - 404 page

4. Create src/components/ui/ with base components:
   - Button.tsx (primary, secondary, accent, ghost, danger variants per design system)
   - Input.tsx (with label, error state, icon support)
   - Card.tsx (Notion-style with optional header)
   - Badge.tsx (for labels, status indicators)
   - Modal.tsx (centered with backdrop)
   - Spinner.tsx (loading indicator)

5. Create src/contexts/AuthContext.tsx:
   - Store user, token, isAuthenticated
   - login, logout functions
   - Persist to localStorage

6. Create src/services/api.ts:
   - Axios instance with base URL
   - Auth token interceptor
   - Error response interceptor

7. Create src/hooks/useAuth.ts:
   - Hook to access auth context

Style all components following the design system exactly. Use Wawanesa Blue for primary actions, Midnight Sky for buttons, Wheatfield Orange for accents.
```

---

# PHASE 2: Authentication & Core Backend

## Prompt 2.1 - Authentication API ✅

```
Continue building the 1:1 Companion app.

Please read /docs/API_SPEC.md (Authentication section), then implement auth in /api:

1. Create src/routes/auth.ts:
   - POST /api/v1/auth/login
     * Validate email and password with Zod
     * Find user by email
     * Verify password with bcrypt
     * Return JWT token and user object
     * Handle: INVALID_CREDENTIALS, ACCOUNT_DISABLED
   
   - POST /api/v1/auth/logout
     * Just return success (stateless JWT)
   
   - GET /api/v1/auth/me
     * Protected route
     * Return current user from token

2. Create src/services/authService.ts:
   - login(email, password) - business logic
   - getUserById(id) - fetch user with relationships

3. Create Zod schemas in src/schemas/auth.ts:
   - loginSchema: email (valid email), password (min 6)

4. Register routes in src/index.ts under /api/v1/auth

5. Test with the seeded users:
   - Admin: admin@wawanesa.com
   - Leader: jordan.smith@wawanesa.com
   - IC: alex.chen@wawanesa.com
   - All passwords: "password123"
```

---

## Prompt 2.2 - Login Page UI ✅

```
Continue building the 1:1 Companion app.

Please read:
- /.claude/skills/frontend-design.md (design system)
- /docs/UI_SCREENS.md (Login Screen section)

Implement a split-screen Login page in /web:

1. Create src/pages/LoginPage.tsx with TWO-COLUMN LAYOUT:

   **LEFT SIDE (Form - white background, ~45% width):**
   - App logo "1:1 Companion" at top left
   - Large welcome heading: "Hello," then "Welcome Back" (bold, Rich Black)
   - Subtitle: "Hey, welcome back to your workspace"
   - Email input (full width, subtle border, placeholder "you@wawanesa.com")
   - Password input (with show/hide toggle, dots for hidden)
   - Row with: "Remember me" checkbox (Wawanesa Blue) + "Forgot Password?" link
   - "Sign In" button (Wawanesa Blue background, white text, rounded)
   - Bottom text: "Don't have an account? Contact Admin"
   - Generous padding and spacing throughout

   **RIGHT SIDE (Visual - ~55% width):**
   - White background (NOT purple/gradient)
   - Orbiting geometric shapes animation (see below)
   - Centered visually, shapes orbit around an invisible center point

2. Create src/components/OrbitingShapes.tsx:
   
   **Four geometric shapes with Neo-Brutalist styling:**
   - Circle: Wheatfield Orange (#D14905)
   - Square: Midnight Sky (#003A5C)
   - Rectangle: Grassy Green (#225935)
   - Triangle: Prairie Gold (#FFD000)
   
   **Styling for each shape:**
   - Thick black borders: 3px solid #000
   - Hard offset shadows: box-shadow: 4px 4px 0 #000
   - Bold, high-contrast feel
   - Size: approximately 60-100px each
   
   **Orbiting Animation:**
   - Shapes revolve around a center point (not just floating up/down)
   - Each shape has different orbit radius (80px, 120px, 160px, 200px)
   - Each shape has different animation duration (8s, 12s, 16s, 20s)
   - Use CSS transforms: rotate() translateX() rotate()
   - Linear timing, infinite loop
   - Counter-rotate the shape itself to keep it upright while orbiting

   **Example CSS keyframes:**
css
   @keyframes orbit {
     from { transform: rotate(0deg) translateX(var(--radius)) rotate(0deg); }
     to   { transform: rotate(360deg) translateX(var(--radius)) rotate(-360deg); }
   }


3. Create src/hooks/useLogin.ts:
   - React Query mutation for login
   - Handle success: save to AuthContext, redirect by role:
     * ADMIN → /admin/users
     * LEADER → /team
     * IC → /workspace
   - Handle error: return error message

4. Styling requirements:
   - Both sides have WHITE background
   - Form side: max-width ~450px content area with padding
   - Visual side: centered orbit animation container
   - Responsive: on mobile, hide right side entirely or stack
   - Smooth transitions on all interactive elements
   - Focus states with Wawanesa Blue outline
   - Checkbox uses Wawanesa Blue when checked

5. Add form validation:
   - Email format validation
   - Password required (min 6 characters)
   - Show inline errors below each field
   - Disable button while loading
   - Show spinner in button while authenticating

Test login with all three user types and verify redirects work correctly.
```

---

## Prompt 2.3 - Protected Route & Layout Shell ✅

```
Continue building the 1:1 Companion app.

Create the app shell and protected routing in /web:

1. Create src/components/ProtectedRoute.tsx:
   - Check if user is authenticated
   - If not, redirect to /login
   - Optional: check for required role(s)
   - Show loading spinner while checking auth

2. Create src/components/layout/AppShell.tsx:
   - Left sidebar navigation (280px wide)
   - Top header bar
   - Main content area
   - Responsive: sidebar collapses on mobile

3. Create src/components/layout/Sidebar.tsx:
   - App logo at top
   - Navigation items based on user role:
     * IC: Workspace (home icon)
     * Leader: My Team (users icon), select IC dropdown
     * Admin: Users, Relationships, Labels, Competencies, Import
   - Active state: Wheatfield Orange left border
   - User profile at bottom with logout

4. Create src/components/layout/Header.tsx:
   - Page title (dynamic based on route)
   - Notification bell with unread badge (placeholder for now)
   - User avatar dropdown

5. Create src/components/layout/UserMenu.tsx:
   - User name and role
   - Settings link (placeholder)
   - Logout button

6. Update App.tsx:
   - Wrap protected routes with AppShell
   - Pass role-based navigation items

Style everything per the design system. The sidebar should feel like Notion - clean, spacious, subtle hover states.
```

---

## Prompt 2.4 - Core API Endpoints Setup ✅

```
Continue building the 1:1 Companion app.

Please read /docs/API_SPEC.md completely, then create the route structure in /api:

1. Create route files (just structure, we'll implement later):
   - src/routes/users.ts (admin user management)
   - src/routes/team.ts (leader's team)
   - src/routes/thoughts.ts
   - src/routes/topics.ts
   - src/routes/meetings.ts
   - src/routes/actions.ts
   - src/routes/labels.ts
   - src/routes/competencies.ts
   - src/routes/notifications.ts
   - src/routes/uploads.ts
   - src/routes/admin/import.ts

2. Create corresponding service files:
   - src/services/userService.ts
   - src/services/thoughtService.ts
   - src/services/topicService.ts
   - src/services/meetingService.ts
   - src/services/actionService.ts
   - src/services/labelService.ts
   - src/services/notificationService.ts

3. Create Zod schemas:
   - src/schemas/thought.ts
   - src/schemas/topic.ts
   - src/schemas/meeting.ts
   - src/schemas/action.ts
   - src/schemas/user.ts

4. Register all routes in src/index.ts with proper prefixes:
   - /api/v1/auth
   - /api/v1/users (admin only)
   - /api/v1/team (leader only)
   - /api/v1/thoughts
   - /api/v1/topics
   - /api/v1/meetings
   - /api/v1/actions
   - /api/v1/labels
   - /api/v1/competencies
   - /api/v1/notifications
   - /api/v1/uploads
   - /api/v1/admin/import (admin only)

5. Create role-check middleware:
   - src/middleware/requireRole.ts
   - requireAdmin, requireLeader, requireIC helpers

Each route file should export a router with placeholder endpoints returning { message: "Not implemented" }.
```

---

# PHASE 3: Block Editor Component

## Prompt 3.1 - Tiptap Block Editor Setup ✅

```
Continue building the 1:1 Companion app.

Please read:
- /docs/DECISIONS.md (Decision 9: Block Editor)
- /.claude/skills/frontend-design.md (Block Editor section)

Install and configure Tiptap in /web:

1. Install Tiptap packages:
   - @tiptap/react
   - @tiptap/starter-kit
   - @tiptap/extension-placeholder
   - @tiptap/extension-task-list
   - @tiptap/extension-task-item
   - @tiptap/extension-link
   - @tiptap/extension-image
   - @tiptap/extension-highlight
   - @tiptap/extension-code-block-lowlight
   - lowlight

2. Create src/components/editor/BlockEditor.tsx:
   - Accept props: content (JSON), onChange, placeholder, editable
   - Configure all extensions from DECISIONS.md
   - Auto-save with 500ms debounce (call onChange)
   - Style the editor container per design system

3. Create src/components/editor/EditorStyles.css:
   - All block styles from frontend-design.md:
     * Headings (H1 blue with orange underline, H2, H3)
     * Paragraphs
     * Blockquotes (orange left border)
     * Lists (orange bullets)
     * Checklists (green checkmarks)
     * Code blocks (midnight sky background)
     * Links (Wawanesa blue)
     * Callouts (info, warning, success variants)

4. Create src/components/editor/SlashCommandMenu.tsx:
   - Trigger on "/" keystroke
   - Show command palette with all block types
   - Filter as user types
   - Keyboard navigation (arrow keys, enter, escape)
   - Grouped by category: Basic, Lists, Media, Formatting
   - Style per design system (floating menu, subtle shadow)

5. Create src/components/editor/FormattingToolbar.tsx:
   - Floating toolbar on text selection
   - Buttons: Bold, Italic, Underline, Strikethrough, Code, Link
   - Active states for applied formats
   - Dark background (Midnight Sky) with white icons

Test the editor works standalone with sample content.
```

---

## Prompt 3.2 - Block Editor Polish & Image Support ✅

```
Continue building the 1:1 Companion app.

Enhance the block editor in /web:

1. Add image support to BlockEditor.tsx:
   - /image command opens file picker
   - Support paste from clipboard
   - Support drag and drop
   - Show upload progress
   - Display image with optional caption
   - Click to view full size (modal)

2. Create src/components/editor/ImageBlock.tsx:
   - Styled image container with border
   - Caption input below image
   - Resize handles (optional, can be Phase 2)

3. Create src/services/uploadService.ts:
   - uploadFile(file) → POST /api/v1/uploads
   - Return { url, id, filename }

4. Create src/hooks/useImageUpload.ts:
   - Handle file selection
   - Upload with progress tracking
   - Return URL for insertion

5. Add file attachment support:
   - /file command opens file picker
   - Display as styled block with icon, filename, size
   - Click to download

6. Create src/components/editor/FileBlock.tsx:
   - File icon based on type
   - Filename and size display
   - Download on click

7. Add keyboard shortcuts display:
   - Create tooltip showing Ctrl+B, Ctrl+I, etc.
   - Show on hover over toolbar buttons

8. Add empty state:
   - When editor is empty and not focused
   - Show placeholder: "Type / for commands..."

Make sure all styles match the design system exactly.
```

---

# PHASE 4: IC Portal

## Prompt 4.1 - Labels API & Component ✅

```
Continue building the 1:1 Companion app.

Implement Labels (used by Thoughts and Topics):

**Backend (/api):**

1. Implement src/routes/labels.ts:
   - GET /api/v1/labels - list all labels
   - POST /api/v1/labels - create label (admin only)
   - PUT /api/v1/labels/:id - update label (admin only)
   - DELETE /api/v1/labels/:id - delete label (admin only)

2. Implement src/services/labelService.ts:
   - getAllLabels()
   - createLabel(name, color)
   - updateLabel(id, name, color)
   - deleteLabel(id) - check if in use first

**Frontend (/web):**

3. Create src/hooks/useLabels.ts:
   - React Query: useLabels() to fetch all
   - useLabelMutations() for create/update/delete

4. Create src/components/LabelBadge.tsx:
   - Display label with background color
   - Small pill shape
   - Text color based on background brightness

5. Create src/components/LabelPicker.tsx:
   - Dropdown to select a label
   - Show color preview
   - "No label" option
   - Used in Thought and Topic forms

Test labels API and components work correctly.
```

---

## Prompt 4.2 - Thoughts Backend API ✅

```
Continue building the 1:1 Companion app.

Please read:
- /docs/API_SPEC.md (Thoughts section)
- /docs/FEATURES.md (Section 2: Thoughts)

Implement Thoughts API in /api:

1. Implement src/routes/thoughts.ts:
   
   - GET /api/v1/thoughts
     * Return user's thoughts (title, label, timestamps only)
     * Filter by labelId (optional)
     * Filter by aboutIcId (for Leaders)
     * Order by updatedAt desc
   
   - GET /api/v1/thoughts/:id
     * Return full thought with content (JSON blocks)
     * 404 if not found or not owner
   
   - POST /api/v1/thoughts
     * Create thought with title, content (default []), labelId
     * For Leaders: accept aboutIcId
     * Return created thought
   
   - PUT /api/v1/thoughts/:id
     * Update title, content, and/or labelId
     * Verify ownership
     * Return updated thought
   
   - DELETE /api/v1/thoughts/:id
     * Verify ownership
     * Hard delete
   
   - POST /api/v1/thoughts/:id/promote
     * Create new Topic with same title, content, label
     * Delete the thought
     * Return new topic

2. Implement src/services/thoughtService.ts:
   - All business logic
   - Handle aboutIcId context for Leaders

3. Create src/schemas/thought.ts:
   - createThoughtSchema
   - updateThoughtSchema
   - Validate content is valid JSON array

Test all endpoints with Postman or curl.
```

---

## Prompt 4.3 - Thoughts Frontend (IC Workspace)

```
Continue building the 1:1 Companion app.

Please read:
- /docs/UI_SCREENS.md (IC Workspace)
- /docs/FEATURES.md (Section 2: Thoughts)
- /.claude/skills/frontend-design.md

Implement the Thoughts feature in /web:

1. Create src/pages/ic/WorkspacePage.tsx:
   - Three-column layout per UI_SCREENS.md:
     * Left: Thoughts panel
     * Middle: Topics panel
     * Right: Meetings/Actions panel
   - Responsive: stack on mobile

2. Create src/components/thoughts/ThoughtPanel.tsx:
   - Header: "📝 Thoughts"
   - Quick capture input at top
   - List of thought cards below

3. Create src/components/thoughts/QuickThoughtInput.tsx:
   - Input with placeholder "Capture a quick thought..."
   - Submit on Enter
   - Optional label picker (collapsed by default)
   - Optimistic update on submit
   - Focus management

4. Create src/components/thoughts/ThoughtCard.tsx:
   - Display title (truncated if long)
   - Label badge
   - Updated timestamp
   - Click → navigate to thought page
   - Hover state with subtle background

5. Create src/pages/ic/ThoughtPage.tsx:
   - Route: /workspace/thoughts/:id
   - Back button "← Back to Workspace"
   - Editable title (large, Wawanesa Blue)
   - Label picker
   - Block editor for content
   - Auto-save on changes
   - "Make it a Topic" button in header
   - Delete option (with confirmation)

6. Create src/hooks/useThoughts.ts:
   - useThoughts() - list
   - useThought(id) - single with content
   - useCreateThought()
   - useUpdateThought()
   - useDeleteThought()
   - usePromoteThought()

7. Add routes to App.tsx:
   - /workspace (WorkspacePage)
   - /workspace/thoughts/:id (ThoughtPage)

Style everything per the design system. The thought page should feel like Notion.
```

---

## Prompt 4.4 - Topics Backend API ✅

```
Continue building the 1:1 Companion app.

Please read:
- /docs/API_SPEC.md (Topics section)
- /docs/FEATURES.md (Section 3: Topics)

Implement Topics API in /api:

1. Implement src/routes/topics.ts:
   
   - GET /api/v1/topics
     * Return user's topics (title, status, label, timestamps)
     * Filter by status (BACKLOG, SCHEDULED, DISCUSSED, ARCHIVED)
     * Filter by labelId
     * Filter by aboutIcId (for Leaders)
     * Order by updatedAt desc
   
   - GET /api/v1/topics/:id
     * Return full topic with content
     * Include meetingTopics if scheduled
     * 404 if not found or not owner
   
   - POST /api/v1/topics
     * Create topic with title, content, labelId
     * Default status: BACKLOG
     * For Leaders: accept aboutIcId
   
   - PUT /api/v1/topics/:id
     * Update title, content, labelId
     * Cannot change status directly (use schedule/archive)
     * Verify ownership
   
   - DELETE /api/v1/topics/:id
     * Only if status is BACKLOG
     * Error if scheduled on a meeting
   
   - POST /api/v1/topics/:id/archive
     * Set status to ARCHIVED

2. Implement src/services/topicService.ts:
   - All business logic
   - Handle status transitions

3. Create src/schemas/topic.ts:
   - createTopicSchema
   - updateTopicSchema

Test all endpoints.
```

---

## Prompt 4.5 - Topics Frontend (IC Workspace) ✅

```
Continue building the 1:1 Companion app.

Please read:
- /docs/UI_SCREENS.md (IC Workspace - Topics panel)
- /docs/FEATURES.md (Section 3: Topics)

Implement the Topics feature in /web:

1. Create src/components/topics/TopicPanel.tsx:
   - shoulds folowo the same layout and design as the Thoughs panel

2. Create src/components/topics/TopicCard.tsx:
   - shoudl follow the same layout of the Thouhgs card

3. Create src/pages/ic/TopicPage.tsx:
   - Route: /workspace/topics/:id
   - shoudl use the same editot as the thouhgts editor
   - "Add to 1:1" button (if backlog) → show meeting picker


4. Create src/components/topics/MeetingPicker.tsx:
   - Dropdown of upcoming meetings
   - Select meeting to schedule topic
   - Confirm action

5. Create src/hooks/useTopics.ts:
   - useTopics(filters) - list
   - useTopic(id) - single
   - useCreateTopic()
   - useUpdateTopic()
   - useDeleteTopic()
   - useScheduleTopic(topicId, meetingId)


7. Add routes:
   - /workspace/topics/:id (TopicPage)

Make the cards draggable (we'll implement drop zones in the meetings section).