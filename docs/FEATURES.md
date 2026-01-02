# Features Specification

## Feature Areas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          1:1 COMPANION                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│   │  Thoughts   │  │   Topics    │  │  Meetings   │  │   Actions   │  │
│   │   (Pages)   │  │   (Pages)   │  │             │  │             │  │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│   │Block Editor │  │    Auth     │  │   Admin     │  │Notifications│  │
│   │   (Core)    │  │             │  │             │  │             │  │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Block Editor (Core Component)

### 1.1 Block Editor Foundation

**Description**: Notion-like block-based content editor used throughout the app.

**User Stories**:
- As a user, I can create rich content using familiar Notion-like interactions
- As a user, I can type `/` to see available block types
- As a user, I can format text with keyboard shortcuts
- As a user, I can add images and files to my content

**Technology**: Tiptap (ProseMirror-based)

**Acceptance Criteria**:
- [ ] Block-based editing with Tiptap
- [ ] Slash command menu triggered by `/`
- [ ] Inline formatting toolbar on text selection
- [ ] Keyboard shortcuts for common formatting
- [ ] Auto-save with debounce (500ms)
- [ ] Placeholder text when empty

**MVP Scope**: ✅ Required

---

### 1.2 Block Types

**Description**: All supported block types in the editor.

| Block Type | Slash Command | Description |
|------------|---------------|-------------|
| Text | `/text` | Plain paragraph |
| Heading 1 | `/h1` | Large section heading (blue, orange underline) |
| Heading 2 | `/h2` | Medium heading (blue) |
| Heading 3 | `/h3` | Small heading (midnight sky) |
| Bulleted List | `/bullet` | Unordered list (orange bullets) |
| Numbered List | `/number` | Ordered list |
| Checklist | `/todo` | Checkbox items (green when checked) |
| Quote | `/quote` | Blockquote (orange left border) |
| Divider | `/divider` | Horizontal line |
| Code Block | `/code` | Syntax highlighted code (midnight sky bg) |
| Callout | `/callout` | Highlighted info box (multiple colors) |
| Image | `/image` | Upload or paste image |
| File | `/file` | Attach a file |
| Link | `/link` | Insert hyperlink |

**Acceptance Criteria**:
- [ ] All block types implemented
- [ ] Proper styling per brand guidelines
- [ ] Blocks can be reordered (drag handle)
- [ ] Blocks can be deleted
- [ ] Tab/Shift+Tab for list indentation

**MVP Scope**: ✅ Required (all basic blocks), ⚠️ Image/File can be Phase 2

---

### 1.3 Inline Formatting

**Description**: Text formatting within blocks.

| Format | Shortcut | Toolbar Button |
|--------|----------|----------------|
| Bold | `Ctrl/⌘ + B` | **B** |
| Italic | `Ctrl/⌘ + I` | *I* |
| Underline | `Ctrl/⌘ + U` | U̲ |
| Strikethrough | `Ctrl/⌘ + Shift + S` | ~~S~~ |
| Inline Code | `Ctrl/⌘ + E` | `</>` |
| Link | `Ctrl/⌘ + K` | 🔗 |
| Highlight | `Ctrl/⌘ + Shift + H` | (Prairie Gold bg) |

**Acceptance Criteria**:
- [ ] Floating toolbar appears on text selection
- [ ] All keyboard shortcuts work
- [ ] Link modal for URL entry
- [ ] Highlight uses Prairie Gold background

**MVP Scope**: ✅ Required

---

### 1.4 Slash Command Menu

**Description**: Command palette for inserting blocks.

**User Stories**:
- As a user, I see a menu when I type `/`
- As a user, I can filter commands by typing
- As a user, I can navigate with arrow keys and select with Enter

**Acceptance Criteria**:
- [ ] Menu appears at cursor when typing `/`
- [ ] Fuzzy search filters commands
- [ ] Keyboard navigation (↑↓ arrows, Enter, Escape)
- [ ] Grouped by category (Basic, Lists, Media, Formatting)
- [ ] Icon and description for each command
- [ ] Menu closes on selection or click outside

**UI Behavior**:
```
/hea
┌─────────────────────────────────────────┐
│ BASIC BLOCKS                            │
│ ─────────────────────────────────────── │
│ H1 Heading 1      Large heading      ←  │  (selected)
│ H2 Heading 2      Medium heading        │
│ H3 Heading 3      Small heading         │
└─────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 1.5 Image Upload

**Description**: Upload and embed images in content.

**User Stories**:
- As a user, I can upload an image from my computer
- As a user, I can paste an image from clipboard
- As a user, I can add a caption to my image

**Acceptance Criteria**:
- [ ] `/image` opens file picker
- [ ] Paste image directly into editor
- [ ] Drag and drop image file
- [ ] Image preview while uploading
- [ ] Optional caption below image
- [ ] Click to expand/view full size
- [ ] Max file size: 10MB
- [ ] Supported formats: PNG, JPG, GIF, WebP

**Storage**: Local filesystem for MVP, S3 for production

**MVP Scope**: ⚠️ Nice to have (can be Phase 2)

---

### 1.6 File Attachment

**Description**: Attach files to content.

**User Stories**:
- As a user, I can attach a file to my thought/topic
- As a user, others can download the file

**Acceptance Criteria**:
- [ ] `/file` opens file picker
- [ ] File block shows: icon, filename, size
- [ ] Click to download
- [ ] Max file size: 25MB
- [ ] Supported: PDF, DOC, XLS, etc.

**MVP Scope**: ⚠️ Nice to have (can be Phase 2)

---

## 1. Authentication & User Management

### 1.1 Login

**Description**: Users authenticate with email and password.

**User Stories**:
- As a user, I can log in with my email and password
- As a user, I see an error if my credentials are invalid
- As a user, I am redirected to my home screen after login

**Acceptance Criteria**:
- [ ] Email field with validation
- [ ] Password field (masked)
- [ ] "Sign In" button
- [ ] Error message for invalid credentials
- [ ] Redirect to dashboard on success
- [ ] JWT token stored in httpOnly cookie or localStorage

**MVP Scope**: ✅ Required

---

### 1.2 Session Management

**Description**: Maintain user session across page refreshes.

**User Stories**:
- As a user, I remain logged in when I refresh the page
- As a user, I am logged out after inactivity (24h)
- As a user, I can manually log out

**Acceptance Criteria**:
- [ ] Token persisted across refreshes
- [ ] Token expiration (24 hours)
- [ ] Logout button in navigation
- [ ] Redirect to login when token expires

**MVP Scope**: ✅ Required

---

### 1.3 Role-Based Access

**Description**: Different users see different interfaces.

**User Stories**:
- As an IC, I only see my workspace
- As a Leader, I see my team and can select ICs
- As an Admin, I see the admin portal

**Acceptance Criteria**:
- [ ] Role stored in JWT/session
- [ ] Route guards based on role
- [ ] IC: `/workspace`
- [ ] Leader: `/team` and `/workspace/:icId`
- [ ] Admin: `/admin/*`

**MVP Scope**: ✅ Required

---

## 2. Thoughts

### 2.1 Quick Thought Capture

**Description**: Rapidly capture a thought title with minimal friction.

**User Stories**:
- As a user, I can quickly add a thought title without leaving my current view
- As a user, I can add a thought with just pressing Enter
- As a user, I can optionally add a label to my thought

**Acceptance Criteria**:
- [ ] Input field always visible in Thoughts area
- [ ] Submit on Enter key
- [ ] Thought appears immediately in list (optimistic update)
- [ ] Optional label dropdown/selector
- [ ] Placeholder text: "Capture a quick thought..."
- [ ] Title limit: 200 characters
- [ ] New thought opens in page view for adding content

**UI Behavior**:
```
┌─────────────────────────────────────────────┐
│ 📝 Thoughts                                 │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Capture a quick thought...          [+] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Career growth discussion           →    │ │  ← Click to open page
│ │ [Development]                           │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Ask about PTO policy               →    │ │
│ │ [Career]                                │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 2.2 Thought Page View

**Description**: Full page editor for thought content with Notion-like blocks.

**User Stories**:
- As a user, I can click a thought to open it as a full page
- As a user, I can add rich content using slash commands
- As a user, I can add headings, lists, quotes, images, and files
- As a user, I can format text with bold, italic, links, etc.

**Acceptance Criteria**:
- [ ] Click thought → opens full page view
- [ ] Editable title at top of page
- [ ] Block-based content editor (Tiptap)
- [ ] Slash command menu (/) for block types
- [ ] Inline formatting toolbar on text selection
- [ ] Auto-save on changes (debounced)
- [ ] Back button returns to list view
- [ ] Label selector in page header

**Block Types Required**:
- [ ] Text (paragraph)
- [ ] Heading 1, 2, 3
- [ ] Bulleted list
- [ ] Numbered list
- [ ] Checklist (todo)
- [ ] Quote (blockquote)
- [ ] Divider
- [ ] Code block
- [ ] Callout box
- [ ] Image (upload/paste)
- [ ] File attachment
- [ ] Link

**Slash Commands**:
```
/text      → Plain text
/h1        → Heading 1
/h2        → Heading 2
/h3        → Heading 3
/bullet    → Bulleted list
/number    → Numbered list
/todo      → Checklist
/quote     → Blockquote
/divider   → Horizontal line
/code      → Code block
/callout   → Callout box
/image     → Upload image
/file      → Attach file
/link      → Insert link
```

**UI Behavior**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Thoughts                                        [Make Topic ▼]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Career growth discussion                              ← Editable title    │
│  [Development]                                         ← Label selector    │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ## What I want to discuss                             ← H2 block          │
│                                                                             │
│  I've been thinking about my promotion timeline and want to understand:    │
│                                                                             │
│  ☑ What skills I need to develop                       ← Checklist         │
│  ☐ Timeline expectations                                                   │
│  ☐ Projects that would demonstrate readiness                               │
│                                                                             │
│  > "Growth happens at the edge of your comfort zone"   ← Quote block       │
│                                                                             │
│  ### Reference materials                               ← H3 block          │
│                                                                             │
│  [Career ladder document](link)                        ← Link              │
│                                                                             │
│  ┌─────────────────────────────────────┐                                   │
│  │  📷 competency-framework.png        │               ← Image             │
│  └─────────────────────────────────────┘                                   │
│                                                                             │
│  Type / for commands...                                ← Placeholder       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 2.3 Thought List

**Description**: View all my thoughts in reverse chronological order.

**User Stories**:
- As a user, I see my thoughts with newest first
- As a user, I can see which label each thought has
- As a user, I can filter thoughts by label
- As a user, I can click a thought to open its page

**Acceptance Criteria**:
- [ ] List of thought cards, newest first
- [ ] Each card shows: title, label (if any), updated timestamp
- [ ] Label shown as colored pill/tag
- [ ] Filter dropdown by label
- [ ] Click card → opens thought page
- [ ] Empty state: "No thoughts yet. Start capturing!"

**MVP Scope**: ✅ Required

---

### 2.4 Edit/Delete Thought

**Description**: Manage existing thoughts.

**User Stories**:
- As a user, I can edit a thought's title and content
- As a user, I can change a thought's label
- As a user, I can delete a thought

**Acceptance Criteria**:
- [ ] Title editable directly in page view
- [ ] Content editable with block editor
- [ ] Label dropdown in page header
- [ ] Delete option in menu (with confirmation)
- [ ] Auto-save changes
- [ ] Optimistic UI updates

**MVP Scope**: ✅ Required

---

### 2.5 Promote Thought to Topic

**Description**: Convert a thought into a topic, preserving all content.

**User Stories**:
- As a user, I can promote a thought to a topic
- As a user, all my content is preserved when promoting
- As a user, the thought is removed after promotion

**Acceptance Criteria**:
- [ ] "Make it a Topic" button in thought page header
- [ ] Confirmation dialog
- [ ] All content (title + blocks) copied to new Topic
- [ ] Label preserved
- [ ] Thought deleted after successful promotion
- [ ] Topic appears in Topics backlog
- [ ] Redirects to new Topic page

**MVP Scope**: ✅ Required

---

## 3. Topics

### 3.1 Topics Backlog

**Description**: View all topics not yet scheduled.

**User Stories**:
- As a user, I see my topics backlog
- As a user, topics are private until I add them to a meeting
- As a user, I can organize topics by label
- As a user, I can click a topic to open its page

**Acceptance Criteria**:
- [ ] List of topic cards with status = BACKLOG
- [ ] Each card shows: title, label, updated date
- [ ] Click card → opens topic page
- [ ] Draggable for scheduling (drag handle on card)
- [ ] Filter by label
- [ ] Empty state: "No topics yet. Promote a thought!"

**MVP Scope**: ✅ Required

---

### 3.2 Topic Page View

**Description**: Full page editor for topic content with Notion-like blocks.

**User Stories**:
- As a user, I can click a topic to open it as a full page
- As a user, I can add rich content using slash commands
- As a user, I can prepare detailed discussion points before my 1:1

**Acceptance Criteria**:
- [ ] Click topic → opens full page view
- [ ] Editable title at top of page
- [ ] Block-based content editor (same as Thoughts)
- [ ] Slash command menu (/) for block types
- [ ] Inline formatting toolbar on text selection
- [ ] Auto-save on changes (debounced)
- [ ] Back button returns to list view
- [ ] Label selector in page header
- [ ] Status indicator (Backlog/Scheduled)
- [ ] "Add to 1:1" button when in backlog

**UI Behavior**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Topics                           [Add to 1:1 ▼]  [Delete]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Career growth path                                    ← Editable title    │
│  [Development]  •  In Backlog                          ← Label + Status    │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ## Context                                                                 │
│                                                                             │
│  I've been in my current role for 18 months and want to discuss the path   │
│  to Senior Developer.                                                       │
│                                                                             │
│  ## Questions to ask                                                        │
│                                                                             │
│  ☐ What does success look like at the next level?                          │
│  ☐ What gaps do you see in my current performance?                         │
│  ☐ Are there upcoming projects that would help me grow?                    │
│                                                                             │
│  ## Supporting evidence                                                     │
│                                                                             │
│  - Led the API redesign project (Q3)                                       │
│  - Mentored 2 junior developers                                            │
│  - Received positive feedback on documentation                             │
│                                                                             │
│  ┌─────────────────────────────────────┐                                   │
│  │  📎 performance-review-2024.pdf     │               ← File attachment   │
│  └─────────────────────────────────────┘                                   │
│                                                                             │
│  Type / for commands...                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 3.3 Create Topic Directly

**Description**: Create a topic without going through thoughts.

**User Stories**:
- As a user, I can create a topic directly
- As a user, I can add rich content immediately

**Acceptance Criteria**:
- [ ] "New Topic" button in Topics area
- [ ] Creates topic with default title "Untitled"
- [ ] Opens topic page immediately for editing
- [ ] Topic added to backlog

**MVP Scope**: ✅ Required

---

### 3.4 Edit/Delete Topic

**Description**: Manage existing topics.

**User Stories**:
- As a user, I can edit a topic's title and content
- As a user, I can change a topic's label
- As a user, I can delete a topic (if not scheduled)

**Acceptance Criteria**:
- [ ] Title and content editable in page view
- [ ] Label dropdown in page header
- [ ] Delete option (with confirmation)
- [ ] Warning if topic is scheduled on a meeting
- [ ] Auto-save changes

**MVP Scope**: ✅ Required

---

### 3.5 Drag Topic to Meeting

**Description**: Schedule a topic by dragging to a meeting.

**User Stories**:
- As a user, I can drag a topic to an upcoming meeting
- As a user, the other party is notified when I do this
- As a user, I see visual feedback during drag

**Acceptance Criteria**:
- [ ] Topics are draggable (drag handle visible)
- [ ] Meetings panel shows drop zones
- [ ] Visual feedback: topic lifts, drop zone highlights
- [ ] On drop: topic status → SCHEDULED
- [ ] Notification sent to other party
- [ ] Optimistic update, rollback on error

**Alternative**: "Add to 1:1" button in topic page view with meeting selector dropdown.

**MVP Scope**: ✅ Required

---

## 4. Meetings

### 4.1 Meeting Schedule

**Description**: View and manage 1:1 meeting schedule.

**User Stories**:
- As a user, I see upcoming meetings
- As a user, I see past meetings
- As a Leader, I can create meetings for each IC

**Acceptance Criteria**:
- [ ] Upcoming meetings section (chronological)
- [ ] Past meetings section (reverse chronological)
- [ ] Each meeting shows: date, topic count, status
- [ ] Click to open meeting detail

**UI Behavior**:
```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Meetings                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ UPCOMING                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Dec 23 ★    │ │ Jan 6       │ │ Jan 20      │            │
│ │ 3 topics    │ │ 1 topic     │ │ No topics   │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│ PAST                                                        │
│ [Dec 9] [Nov 25] [Nov 11] [Oct 28] ...                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 4.2 Create Meeting (Leader Only)

**Description**: Leaders create 1:1 meetings.

**User Stories**:
- As a Leader, I can create a new 1:1 meeting
- As a Leader, I set the date and optional title
- As a Leader, I can create recurring meetings (V2)

**Acceptance Criteria**:
- [ ] "New Meeting" button (Leaders only)
- [ ] Date picker
- [ ] Optional title field
- [ ] Meeting created in SCHEDULED status
- [ ] Appears in upcoming meetings

**MVP Scope**: ✅ Required (single meeting creation)
**V2**: Recurring meeting patterns

---

### 4.3 Meeting Detail View

**Description**: The shared workspace for a 1:1 meeting with rich notes.

**User Stories**:
- As a user, I see all topics on this meeting's agenda
- As a user, I see who added each topic
- As a user, I can click a topic to view its full page content
- As a user, I can add rich notes during the meeting with block editor
- As a user, I can resolve each topic

**Acceptance Criteria**:
- [ ] Meeting header: date, title, status
- [ ] Agenda section: list of meeting topics (cards)
- [ ] Each topic shows: title, label, who added (👤/👥)
- [ ] Click topic card → opens topic page in side panel or modal
- [ ] Notes section: block-based editor (same as Thoughts/Topics)
- [ ] Slash commands work in notes
- [ ] Topic resolution controls (for completed/in-progress meetings)
- [ ] Auto-save notes

**UI Behavior**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back    1:1 with Jordan Smith • Dec 23, 2024              [End Meeting] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📋 AGENDA                                                                  │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📌 Career growth discussion                                   👤   │   │
│  │     [Development]                                      [View →]     │   │
│  │     Resolution: ○ Done  ○ Next 1:1  ○ Backlog  ○ Create Action      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📌 Q1 project scope                                           👥   │   │
│  │     [Projects]                                         [View →]     │   │
│  │     Resolution: ● Done  ○ Next 1:1  ○ Backlog  ○ Create Action      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  📝 MEETING NOTES                                     ← Block editor       │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ## Key Decisions                                                           │
│                                                                             │
│  - Agreed to target Q2 for promotion conversation                          │
│  - Alex will lead the Q1 planning session                                  │
│                                                                             │
│  ## Action Items                                                            │
│                                                                             │
│  ☑ Alex: Prepare leadership presentation outline                           │
│  ☐ Jordan: Share promotion criteria document                               │
│                                                                             │
│  > Great energy in this meeting! Alex is ready for more visibility.        │
│                                                                             │
│  Type / for commands...                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Topic Side Panel** (when clicking "View →"):
```
┌──────────────────────────────────────────────┐
│  Career growth discussion              [×]   │
│  [Development]                               │
├──────────────────────────────────────────────┤
│                                              │
│  ## What I want to discuss                   │
│                                              │
│  I've been thinking about my promotion       │
│  timeline and want to understand:            │
│                                              │
│  ☑ What skills I need to develop             │
│  ☐ Timeline expectations                     │
│  ☐ Projects that would help                  │
│                                              │
│  ...full topic content...                    │
│                                              │
└──────────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

**UI Reference**: See `UI_SCREENS.md` for detailed wireframe

---

### 4.4 Topic Resolution

**Description**: After discussing a topic, mark its outcome.

**User Stories**:
- As a user, I can mark a topic as Done
- As a user, I can move a topic to the next meeting
- As a user, I can return a topic to my backlog
- As a user, I can create an action from a topic

**Acceptance Criteria**:
- [ ] Resolution options appear for each topic
- [ ] Radio buttons: Done | Next 1:1 | Backlog | Create Action
- [ ] "Done": archives the topic
- [ ] "Next 1:1": adds to next scheduled meeting
- [ ] "Backlog": returns to creator's backlog
- [ ] "Create Action": opens action creation form

**UI Behavior**:
```
┌─────────────────────────────────────────────────────────────┐
│ 📌 Career growth path                                  👤   │
│    Label: Development                                       │
│                                                             │
│    Resolution:                                              │
│    ○ Done  ○ Next 1:1  ○ Backlog  ● Create Action          │
│                                                             │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ New Action                                          │ │
│    │ Title: [ Lead Q1 planning discussion            ]   │ │
│    │ Owner: [ IC ▼ ]                                     │ │
│    │ Competency: [ Communication & Influence ▼ ]         │ │
│    │ Due: [ Jan 15 ]                                     │ │
│    │                                      [Create]       │ │
│    └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 4.5 Complete Meeting

**Description**: Mark a meeting as complete after the 1:1.

**User Stories**:
- As a user, I can mark a meeting as complete
- As a user, unresolved topics prompt me for resolution
- As a user, the meeting moves to Past

**Acceptance Criteria**:
- [ ] "End Meeting" button
- [ ] Prompt if any topics unresolved
- [ ] Meeting status → COMPLETED
- [ ] Moves to Past meetings
- [ ] Read-only after completion

**MVP Scope**: ✅ Required

---

## 5. Actions

### 5.1 Actions List

**Description**: View all actions across 1:1s.

**User Stories**:
- As a user, I see actions assigned to me
- As a user, I see actions I created for others
- As a user, I can filter by status and competency

**Acceptance Criteria**:
- [ ] List of actions, grouped by status
- [ ] Each action shows: title, owner, competency, due date, status
- [ ] Filter by: status, competency
- [ ] Click to open action detail

**MVP Scope**: ✅ Required

---

### 5.2 Action Detail

**Description**: View and manage an action.

**User Stories**:
- As a user, I see action details and history
- As a user, I can add progress updates
- As a user, I can change status

**Acceptance Criteria**:
- [ ] Header: title, owner, competency badge
- [ ] Metadata: created date, due date, origin meeting/topic
- [ ] Status selector: Not Started | In Progress | Complete | Blocked
- [ ] Progress thread: chronological updates from both parties
- [ ] Add update form

**UI Behavior**:
```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Lead Q1 planning discussion                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Owner: Alex Chen (IC)                                       │
│ Competency: [Communication & Influence]                     │
│ Due: Jan 15, 2025                                           │
│ From: Dec 23 1:1 → "Career growth path"                     │
│                                                             │
│ Status: [In Progress ▼]                                     │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ PROGRESS                                                    │
│                                                             │
│ Dec 23 • Alex Chen                                          │
│ Started prepping the agenda, reviewing last year's data.    │
│                                                             │
│ Dec 28 • Alex Chen                                          │
│ Draft agenda ready, will practice dry run with Sarah.       │
│                                                             │
│ Dec 30 • Jordan (Leader)                                    │
│ Great progress! Let me know if you want to rehearse.        │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Add an update...                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                              [Add Update]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 5.3 Growth Summary

**Description**: Aggregate view of actions by competency.

**User Stories**:
- As a user, I see how many actions I've completed per competency
- As a Leader, I see this for each IC
- As a user, I can use this for review preparation

**Acceptance Criteria**:
- [ ] Bar chart or summary of actions per competency
- [ ] Filter by time period (Q1, Q2, YTD, etc.)
- [ ] List of completed actions per competency
- [ ] Export option (V2)

**MVP Scope**: ⚠️ Nice to have (simple version)

---

## 6. Navigation & Layout

### 6.1 IC Navigation

**Description**: Sidebar navigation for ICs.

**Structure**:
```
┌─────────────────────┐
│ 1:1 Companion       │
├─────────────────────┤
│                     │
│ 📝 Thoughts         │
│ 📌 Topics           │
│ 📅 1:1s             │
│ ⚡ Actions          │
│                     │
│ ─────────────────── │
│                     │
│ 👤 Profile          │
│ 🚪 Logout           │
│                     │
└─────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 6.2 Leader Navigation

**Description**: Sidebar navigation for Leaders.

**Structure**:
```
┌─────────────────────┐
│ 1:1 Companion       │
├─────────────────────┤
│                     │
│ 👥 MY TEAM          │
│   ├─ Alex Chen      │
│   ├─ Sam Johnson    │
│   └─ Pat Williams   │
│                     │
│ ─────────────────── │
│                     │
│ [Selected IC]       │
│ 📝 Thoughts         │
│ 📌 Topics           │
│ 📅 1:1s             │
│ ⚡ Actions          │
│                     │
│ ─────────────────── │
│                     │
│ 👤 Profile          │
│ 🚪 Logout           │
│                     │
└─────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 6.3 Admin Navigation

**Description**: Sidebar navigation for Admins.

**Structure**:
```
┌─────────────────────┐
│ 1:1 Companion       │
│ Admin Portal        │
├─────────────────────┤
│                     │
│ 👤 Users            │
│ 🔗 Relationships    │
│ 🏷️ Labels           │
│ 🎯 Competencies     │
│ ⚙️ Settings         │
│                     │
│ ─────────────────── │
│                     │
│ 🚪 Logout           │
│                     │
└─────────────────────┘
```

**MVP Scope**: ✅ Required

---

## 7. Admin Portal

### 7.1 User Management

**Description**: Create and manage users.

**User Stories**:
- As an Admin, I can create new users
- As an Admin, I can assign roles
- As an Admin, I can deactivate users

**Acceptance Criteria**:
- [ ] User list with search
- [ ] Create user form: email, name, role
- [ ] Edit user details
- [ ] Deactivate (soft delete)
- [ ] Password reset trigger

**MVP Scope**: ✅ Required (basic CRUD)

---

### 7.2 Relationship Management

**Description**: Assign Leaders to ICs.

**User Stories**:
- As an Admin, I can assign an IC to a Leader
- As an Admin, I can reassign an IC to a different Leader
- As an Admin, I see all current relationships

**Acceptance Criteria**:
- [ ] Relationship list: Leader → IC pairs
- [ ] Create relationship: select Leader, select IC
- [ ] Validation: IC can only have one Leader
- [ ] Reassign: change IC's Leader
- [ ] Delete relationship (with warning about data)

**MVP Scope**: ✅ Required

---

### 7.3 Label Configuration

**Description**: Manage labels for thoughts/topics.

**User Stories**:
- As an Admin, I can create labels
- As an Admin, I can set label colors
- As an Admin, I can rename or delete labels

**Acceptance Criteria**:
- [ ] Label list with color swatches
- [ ] Create: name + color picker
- [ ] Edit: name and color
- [ ] Delete: with warning if in use

**MVP Scope**: ✅ Required

---

### 7.4 Competency Configuration

**Description**: Manage company competency framework.

**User Stories**:
- As an Admin, I can add competencies
- As an Admin, I can reorder competencies
- As an Admin, I can edit descriptions

**Acceptance Criteria**:
- [ ] Competency list with drag-to-reorder
- [ ] Create: name + description
- [ ] Edit: name, description
- [ ] Delete: with warning if in use

**MVP Scope**: ✅ Required

---

## 8. Admin Bulk Import

### 8.1 CSV Import for Organization Structure

**Description**: Admins can bulk import Leaders, ICs, and their relationships via a single CSV file.

**User Stories**:
- As an admin, I can upload a CSV file to import the entire org structure
- As an admin, I can preview the import before confirming
- As an admin, I see validation errors before import
- As an admin, Leaders and ICs are created with relationships automatically

**CSV Format**:
```csv
LeaderEmail,ICFirstName,ICLastName,ICEmail,ICPosition,ICYearsOfService,ICTimeInPosition
jordan.smith@wawanesa.com,Alex,Chen,alex.chen@wawanesa.com,Software Developer,3,1.5
jordan.smith@wawanesa.com,Sam,Johnson,sam.johnson@wawanesa.com,Senior Developer,5,2
taylor.wong@wawanesa.com,Pat,Williams,pat.williams@wawanesa.com,QA Engineer,2,1
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| LeaderEmail | String | ✅ | Leader's email (must exist OR will be created) |
| ICFirstName | String | ✅ | IC's first name |
| ICLastName | String | ✅ | IC's last name |
| ICEmail | String | ✅ | IC's email address |
| ICPosition | String | ✅ | IC's job title / position |
| ICYearsOfService | Number | ✅ | IC's total years at company |
| ICTimeInPosition | Number | ✅ | IC's years in current position |

**Import Logic**:
1. Parse CSV and validate structure
2. For each row:
   - Check if Leader exists by email
   - If Leader doesn't exist → create with role=LEADER (name derived from email)
   - Check if IC exists by email
   - If IC doesn't exist → create with role=IC
   - If IC exists but has different Leader → show warning
   - Create Relationship (Leader → IC)
3. Generate temporary passwords for new users
4. Return summary with credentials

**Acceptance Criteria**:
- [ ] "Import Organization" button in Admin portal
- [ ] File upload accepts .csv files only
- [ ] Parse and validate CSV structure
- [ ] Preview table showing parsed data grouped by Leader
- [ ] Validation errors shown inline
- [ ] Duplicate IC detection (same IC, different leader = error)
- [ ] Confirm button to execute import
- [ ] Progress indicator for large imports
- [ ] Success summary: X leaders, Y ICs imported, Z skipped
- [ ] New users created with temporary passwords
- [ ] Relationships automatically created
- [ ] Download credentials CSV after import

**UI Behavior**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Admin Portal                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Users]  [Relationships]  [Labels]  [Competencies]  [Import]              │
│                                                       ═══════               │
│                                                                             │
│  Import Organization Structure                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  Upload a CSV file to bulk import Leaders, ICs, and their relationships.   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │                    📄                                               │   │
│  │                                                                     │   │
│  │         Drop CSV file here or click to browse                      │   │
│  │                                                                     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Required columns:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ LeaderEmail, ICFirstName, ICLastName, ICEmail, ICPosition,         │   │
│  │ ICYearsOfService, ICTimeInPosition                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [↓ Download Template]                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

After file upload → Preview (grouped by Leader):

┌─────────────────────────────────────────────────────────────────────────────┐
│  Import Organization Structure                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  📄 org-structure.csv (3 rows)                         [Change File]       │
│                                                                             │
│  PREVIEW                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  👤 jordan.smith@wawanesa.com                         [NEW LEADER]  │   │
│  │  ├── ✓ Alex Chen         Software Developer    3 yrs    1.5 yrs    │   │
│  │  │      alex.chen@wawanesa.com                                      │   │
│  │  └── ✓ Sam Johnson       Senior Developer      5 yrs    2 yrs      │   │
│  │         sam.johnson@wawanesa.com                                    │   │
│  │                                                                     │   │
│  │  👤 taylor.wong@wawanesa.com                          [EXISTS]      │   │
│  │  └── ⚠ Pat Williams      QA Engineer           -       1 yr        │   │
│  │         pat.williams@wawanesa.com    Missing: ICYearsOfService     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Summary:                                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  👤 Leaders:  1 new, 1 existing                                    │    │
│  │  👥 ICs:      2 ready to import, 1 will be skipped                 │    │
│  │  🔗 Relationships: 2 will be created                               │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│                                              [Cancel]  [Import 2 ICs]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

After import → Success:

┌─────────────────────────────────────────────────────────────────────────────┐
│  Import Complete ✓                                                          │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│                              ✅                                             │
│                                                                             │
│                 Successfully imported organization structure!               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LEADERS CREATED (1)                                                │   │
│  │  ────────────────────────────────────────────────────────────────   │   │
│  │  Jordan Smith    jordan.smith@wawanesa.com       TempPass789!       │   │
│  │                                                                     │   │
│  │  ICs CREATED (2)                                                    │   │
│  │  ────────────────────────────────────────────────────────────────   │   │
│  │  Alex Chen       alex.chen@wawanesa.com          TempPass123!       │   │
│  │  Sam Johnson     sam.johnson@wawanesa.com        TempPass456!       │   │
│  │                                                                     │   │
│  │  RELATIONSHIPS CREATED (2)                                          │   │
│  │  ────────────────────────────────────────────────────────────────   │   │
│  │  Jordan Smith → Alex Chen                                           │   │
│  │  Jordan Smith → Sam Johnson                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ⚠ 1 skipped: Pat Williams (missing ICYearsOfService)                      │
│                                                                             │
│  [↓ Download All Credentials]                                    [Done]    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**MVP Scope**: ✅ Required

---

### 8.2 CSV Template Download

**Description**: Provide a downloadable CSV template for organization import.

**User Stories**:
- As an admin, I can download a CSV template
- As an admin, the template shows the correct format with examples

**Template Content**:
```csv
LeaderEmail,ICFirstName,ICLastName,ICEmail,ICPosition,ICYearsOfService,ICTimeInPosition
leader@wawanesa.com,John,Doe,john.doe@wawanesa.com,Software Developer,2,1
leader@wawanesa.com,Jane,Smith,jane.smith@wawanesa.com,Senior Analyst,5,2.5
another.leader@wawanesa.com,Bob,Wilson,bob.wilson@wawanesa.com,QA Engineer,3,1
```

**Acceptance Criteria**:
- [ ] "Download Template" link in import page
- [ ] Template includes headers and 3 example rows (showing multiple leaders)
- [ ] Downloads as `org-import-template.csv`

**MVP Scope**: ✅ Required

---

### 8.3 Import Validation Rules

**Description**: Validation rules for organization CSV import.

**Validation Rules**:
| Rule | Error Message |
|------|---------------|
| Missing required column | "Missing required column: {column}" |
| Empty LeaderEmail | "Row {n}: LeaderEmail is required" |
| Invalid LeaderEmail format | "Row {n}: LeaderEmail is not a valid email" |
| Empty ICFirstName | "Row {n}: ICFirstName is required" |
| Empty ICLastName | "Row {n}: ICLastName is required" |
| Empty ICEmail | "Row {n}: ICEmail is not a valid email" |
| Empty ICPosition | "Row {n}: ICPosition is required" |
| Invalid ICYearsOfService | "Row {n}: ICYearsOfService must be a number" |
| Invalid ICTimeInPosition | "Row {n}: ICTimeInPosition must be a number" |
| Duplicate ICEmail in file | "Row {n}: Duplicate IC email {email} (also on row {m})" |
| IC already exists with different Leader | "Row {n}: {name} is already assigned to {other_leader}" |
| ICYearsOfService < ICTimeInPosition | "Row {n}: ICTimeInPosition cannot exceed ICYearsOfService" |
| IC email same as Leader email | "Row {n}: IC cannot be their own Leader" |

**MVP Scope**: ✅ Required

---

### 8.4 Import History

**Description**: View history of all organization imports.

**User Stories**:
- As an admin, I can see past imports
- As an admin, I can see who imported and when
- As an admin, I can download credentials from past imports

**Acceptance Criteria**:
- [ ] Import history table in Admin portal
- [ ] Shows: date, admin who imported, file name, counts
- [ ] Option to download credentials (if within 7 days)
- [ ] Credentials auto-expire after 7 days for security

**MVP Scope**: ⚠️ Nice to have (Phase 2)

---

## 9. Notifications

### 8.1 In-App Notifications

**Description**: Notification bell with unread count.

**User Stories**:
- As a user, I see a notification when someone adds a topic to our meeting
- As a user, I see unread count on notification bell
- As a user, I can mark notifications as read

**Acceptance Criteria**:
- [ ] Bell icon in header with unread badge
- [ ] Dropdown shows recent notifications
- [ ] Each notification: title, message, timestamp
- [ ] Click notification → navigate to relevant area
- [ ] Mark as read on click
- [ ] "Mark all read" option

**MVP Scope**: ✅ Required

---

### 8.2 Email Notifications

**Description**: Email alerts for key events.

**User Stories**:
- As a user, I receive an email when someone adds a topic to our meeting
- As a user, I can click the email to go directly to the meeting

**Acceptance Criteria**:
- [ ] Email sent for TOPIC_ADDED events
- [ ] Email includes: topic title, meeting date, link
- [ ] Simple HTML template
- [ ] Unsubscribe option (V2)

**MVP Scope**: ⚠️ Nice to have

---

## Feature Priority Matrix

| Feature | Priority | Effort | MVP |
|---------|----------|--------|-----|
| Auth (login, logout, session) | P0 | M | ✅ |
| Thoughts CRUD | P0 | S | ✅ |
| Topics CRUD | P0 | S | ✅ |
| Promote Thought → Topic | P0 | S | ✅ |
| Meetings list | P0 | S | ✅ |
| Meeting detail view | P0 | M | ✅ |
| Drag topic to meeting | P0 | M | ✅ |
| Topic resolution | P0 | M | ✅ |
| Actions CRUD | P0 | M | ✅ |
| Progress updates | P0 | S | ✅ |
| Leader IC selector | P0 | S | ✅ |
| Admin user management | P1 | M | ✅ |
| Admin relationships | P1 | S | ✅ |
| Admin labels | P1 | S | ✅ |
| Admin competencies | P1 | S | ✅ |
| In-app notifications | P1 | M | ✅ |
| Email notifications | P2 | M | ⚠️ |
| Growth summary | P2 | M | ⚠️ |
| Recurring meetings | P3 | L | ❌ |
| Outlook integration | P3 | XL | ❌ |

**Legend**: S = Small (< 1 day), M = Medium (1-3 days), L = Large (3-5 days), XL = Extra Large (> 1 week)
