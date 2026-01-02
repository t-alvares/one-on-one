## Prompt 4.7 - Leader IC Workspace (Thoughts & Topics per IC)

```
Continue building the 1:1 Companion app.

Implement the Leader's workspace for a specific IC. This mirrors the IC workspace but shows the Leader's thoughts and topics ABOUT that IC:

1. Create src/pages/leader/ICWorkspacePage.tsx:
   - Route: /team/:icId
   - Uses LeaderLayout
   - Header: "[IC Name]" with back arrow to /team
   - Subheader: IC's position, years of service
   - Three-column layout (same as IC workspace):
     * Left: Thoughts
     * Middle: Topics  
     * Right: Placeholder for Meetings + Actions (coming in later prompts)

2. Create src/contexts/ICContext.tsx:
   - Stores currently viewed IC: { id, name, position, ... }
   - Provider wraps ICWorkspacePage
   - useICContext() hook to access current IC
   - Fetches IC details on mount using icId from URL params

3. Create src/components/leader/LeaderThoughtPanel.tsx:
   - Similar to IC's ThoughtPanel
   - Header: "💭 My Thoughts"
   - Quick capture input at top
   - List of thought cards
   - Key difference: When creating/fetching thoughts, use aboutIcId = current IC's id
   - Filter: GET /api/v1/thoughts?aboutIcId=xxx

4. Create src/components/leader/LeaderTopicPanel.tsx:
   - Header: "📋 Topics"
   - "New Topic" button
   - Two sections:
     a) "My Topics" - Leader's topics about this IC
        - Editable, can drag to meetings (later)
     b) "Their Topics" - IC's topics (from their backlog)
        - Read-only, different styling (lighter background, 👥 icon)
        - Shows what IC wants to discuss
   - Filter tabs: All | Mine | Theirs

5. Update API to support aboutIcId and cross-party topics:
   
   Backend - Update GET /api/v1/thoughts:
   - Add optional query param: ?aboutIcId=xxx
   - If aboutIcId provided, filter thoughts where aboutIcId matches
   
   Backend - Update GET /api/v1/topics:
   - Add optional query params: ?aboutIcId=xxx&includeCounterparty=true
   - If aboutIcId provided, filter Leader's topics where aboutIcId matches
   - If includeCounterparty=true, also include IC's topics (marked with isCounterparty: true)

6. Update POST /api/v1/thoughts and POST /api/v1/topics:
   - Accept optional aboutIcId in body
   - For Leaders, this links the thought/topic to a specific IC context

7. Create src/components/leader/LeaderWorkspaceRightPanel.tsx:
   - Placeholder for now
   - Shows: "📅 Meetings" section with message "Coming soon"
   - Shows: "⚡ Actions" section with message "Coming soon"

8. Update LeaderTopicCard (or extend TopicCard):
   - Add "isCounterparty" prop
   - If true: show 👥 icon, lighter background, "From [IC Name]" label
   - If true: read-only (no edit/delete)

Test navigating to an IC workspace, creating thoughts and topics about that IC.
```

---

## Prompt 4.8 - Schema Update & Meetings Backend API

```
Continue building the 1:1 Companion app.

Now implement the Meetings backend. IMPORTANT: Meetings are OWNED by Leaders - they create the meeting records, and ICs see them.

First, update the schema:

1. Update prisma/schema.prisma - Add createdById to Meeting model:

   model Meeting {
     id             String        @id @default(uuid())
     relationshipId String
     createdById    String        // The Leader who created this meeting
     scheduledAt    DateTime
     title          String?
     status         MeetingStatus @default(SCHEDULED)
     createdAt      DateTime      @default(now())
     updatedAt      DateTime      @updatedAt

     relationship Relationship @relation(fields: [relationshipId], references: [id])
     createdBy    User         @relation("MeetingsCreated", fields: [createdById], references: [id])

     topics  MeetingTopic[]
     notes   MeetingNote[]
     actions Action[]

     @@index([relationshipId])
     @@index([createdById])
     @@index([scheduledAt])
     @@index([status])
   }

2. Add to User model:
   meetingsCreated Meeting[] @relation("MeetingsCreated")

3. Run migration:
   npx prisma migrate dev --name add_meeting_creator

Now implement Meetings API:

4. Implement src/routes/meetings.ts:
   
   - GET /api/v1/meetings
     * Query params: ?icId=xxx (optional, for Leaders to filter by IC)
     * For Leaders: return meetings they created, filter by icId if provided
     * For ICs: return meetings where they are the IC in the relationship
     * Include: topics count, next meeting indicator
     * Sort by scheduledAt ascending (upcoming first)
     * Separate into: upcoming (scheduledAt >= now), past (scheduledAt < now)

   - GET /api/v1/meetings/:id
     * Return full meeting with:
       - Meeting details (id, title, scheduledAt, status)
       - Relationship info (leader name, IC name)
       - All meeting topics with: topic title, label, addedBy user info
       - Meeting notes (if any)
       - Actions created from this meeting (if any)
     * Verify user is either the creator (Leader) or the IC in the relationship
     * Return 403 if not authorized

   - POST /api/v1/meetings (Leader only)
     * Body: { icId, scheduledAt, title? }
     * Find relationship between current user (Leader) and icId
     * Create meeting with createdById = current user
     * Title defaults to "1:1 with [IC Name]" if not provided
     * Return 403 if caller is not a Leader
     * Return 404 if no relationship exists

   - POST /api/v1/meetings/generate (Leader only)
     * Generate recurring meetings
     * Body: { 
         icId, 
         frequency: 'weekly' | 'biweekly', 
         dayOfWeek: 0-6 (0=Sunday, 1=Monday, etc), 
         time: 'HH:mm', 
         count: number (how many meetings to create)
       }
     * Calculate dates based on frequency starting from next occurrence of dayOfWeek
     * Create all meetings in a transaction
     * Return array of created meetings

   - PUT /api/v1/meetings/:id (Leader only)
     * Update scheduledAt, title, status
     * Verify caller is the creator (createdById)

   - DELETE /api/v1/meetings/:id (Leader only)
     * Only allowed if: status is SCHEDULED AND no topics added
     * Verify caller is the creator
     * Return 400 if meeting has topics (must remove them first)

   - POST /api/v1/meetings/:id/topics
     * Add a topic to meeting agenda
     * Body: { topicId }
     * Creates MeetingTopic join record
     * Sets topic status to SCHEDULED
     * Verify: user owns the topic AND user is part of this meeting's relationship
     * Return 400 if topic already scheduled to another meeting

   - DELETE /api/v1/meetings/:id/topics/:topicId
     * Remove topic from meeting
     * Deletes MeetingTopic record
     * Reset topic status to BACKLOG
     * Verify: user added this topic OR user is the Leader (creator)

   - POST /api/v1/meetings/:id/complete (Leader only)
     * Set status to COMPLETED
     * Body: { resolutions: [...] } - handled in Prompt 4.12
     * For now, just set status to COMPLETED
     * Verify caller is the creator

5. Implement src/services/meetingService.ts:
   - createMeeting(leaderId, icId, scheduledAt, title?)
   - generateRecurringMeetings(leaderId, icId, options)
   - getMeetingsForLeader(leaderId, icId?)
   - getMeetingsForIC(icId)
   - getMeetingById(meetingId, userId)
   - addTopicToMeeting(meetingId, topicId, userId)
   - removeTopicFromMeeting(meetingId, topicId, userId)
   - completeMeeting(meetingId, leaderId)
   - updateMeeting(meetingId, leaderId, updates)
   - deleteMeeting(meetingId, leaderId)

6. Create src/schemas/meeting.ts:
   - createMeetingSchema: { icId: uuid, scheduledAt: datetime, title?: string }
   - generateMeetingsSchema: { icId: uuid, frequency: enum, dayOfWeek: 0-6, time: HH:mm, count: 1-52 }
   - updateMeetingSchema: { scheduledAt?: datetime, title?: string, status?: enum }
   - addTopicSchema: { topicId: uuid }

7. Register routes in src/index.ts under /api/v1/meetings

Test with Postman/curl:
- Create a single meeting as Leader
- Generate 4 weekly meetings
- Get meetings as Leader (should see created meetings)
- Get meetings as IC (should see meetings where they're the IC)
```

---

## Prompt 4.9 - Leader Meeting Management (Frontend)

```
Continue building the 1:1 Companion app.

Add meeting management UI to the Leader's IC Workspace:

1. Update src/components/leader/LeaderWorkspaceRightPanel.tsx:
   - Replace placeholder with actual MeetingPanel
   - Layout: MeetingPanel on top, ActionPanel below (Actions still placeholder)

2. Create src/components/leader/LeaderMeetingPanel.tsx:
   - Header: "📅 1:1 Meetings" 
   - "Generate Meetings" button (opens modal)
   - Sections:
     * "Upcoming" - meetings where scheduledAt >= today, expanded by default
     * "Past" - meetings where scheduledAt < today, collapsed by default
   - If no meetings: "No meetings scheduled" + "Generate your first meetings" button

3. Create src/components/leader/GenerateMeetingsModal.tsx:
   - Modal title: "Generate Recurring 1:1s"
   - Form fields:
     * Frequency: Radio buttons - "Weekly" | "Every 2 Weeks"
     * Day: Dropdown - Monday through Friday
     * Time: Time input (default 10:00 AM)
     * Number of meetings: Dropdown - 4, 8, 12 weeks
   - Preview section showing calculated dates:
     "This will create meetings on:"
     - Mon, Jan 6 at 10:00 AM
     - Mon, Jan 13 at 10:00 AM
     - ... etc
   - Buttons: "Cancel" | "Generate X Meetings"
   - On success: close modal, refresh meeting list, show success toast

4. Create src/components/meetings/MeetingCard.tsx (shared):
   - Displays a single meeting
   - Content:
     * Date formatted: "Mon, Jan 6" (large)
     * Time: "10:00 AM"
     * Title (or "1:1 Meeting" if no title)
     * Topic count badge: "3 topics" (if any)
   - Status styling:
     * Today: Orange left border + "Today" badge
     * Upcoming: Blue left border
     * Completed: Green left border + checkmark
     * Past (not completed): Grey, muted
   - Click → navigate to /meetings/:id
   - For drag-drop (topics): Add drop zone indicator (implement in next step)

5. Create src/components/leader/QuickAddMeetingButton.tsx:
   - Small "+ Add single meeting" link below meeting list
   - Opens inline form or small modal:
     * Date picker
     * Time picker
     * Title (optional)
   - Creates one meeting via POST /api/v1/meetings

6. Add meeting actions (on MeetingCard hover or menu):
   - "Reschedule" → opens date/time picker modal
   - "Cancel" → confirmation dialog → DELETE endpoint
   - Only show for SCHEDULED meetings

7. Implement drag-drop for topics into meetings:
   - Install: npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   - Wrap ICWorkspacePage content in DndContext
   - Make TopicCard draggable:
     * Add drag handle or make whole card draggable
     * Only BACKLOG topics are draggable
   - Make MeetingCard a drop zone:
     * Highlight when topic dragged over
     * On drop: call POST /api/v1/meetings/:id/topics
     * Show success toast: "Topic scheduled for [date]"
     * Topic card updates to show SCHEDULED status

8. Create src/hooks/useMeetings.ts:
   - useMeetings(icId?) - list meetings, optionally filtered by IC
   - useMeeting(id) - single meeting with full details
   - useCreateMeeting()
   - useGenerateMeetings()
   - useUpdateMeeting()
   - useDeleteMeeting()
   - useAddTopicToMeeting()
   - useRemoveTopicFromMeeting()

9. Update TopicCard to show scheduled state:
   - If topic.status === 'SCHEDULED':
     * Show small calendar icon
     * Show scheduled meeting date
     * Not draggable (already scheduled)
     * Can click to unschedule (removes from meeting)

Test the full flow:
- Navigate to IC workspace
- Click "Generate Meetings" → create 4 weekly meetings
- See meetings appear in panel
- Drag a topic to a meeting
- See topic status change to SCHEDULED
```

---

## Prompt 4.10 - IC Workspace: Meeting View

```
Continue building the 1:1 Companion app.

Add Meetings panel to the IC Workspace. ICs see meetings created by their Leader and can add their topics:

1. Create src/components/ic/ICMeetingPanel.tsx:
   - Header: "📅 Upcoming 1:1s"
   - NO create button (ICs don't create meetings)
   - Sections:
     * "Next Meeting" - single card, highlighted (if exists)
     * "Upcoming" - other upcoming meetings
     * "Past" - collapsed by default
   - Empty state: 
     "No meetings scheduled yet"
     "Your leader will schedule your 1:1 meetings"

2. Update IC WorkspacePage.tsx:
   - Add ICMeetingPanel to right column
   - Wrap in DndContext for drag-drop

3. Update IC's TopicCard for drag-drop:
   - Make BACKLOG topics draggable
   - Use same @dnd-kit setup as Leader workspace
   - On drop to meeting: call POST /api/v1/meetings/:id/topics
   - Show toast: "Topic added to [Meeting Date]"

4. Use shared MeetingCard component:
   - Same component as Leader uses
   - Shows Leader's name: "with [Leader Name]"
   - Click → /meetings/:id

5. Update IC's TopicPanel:
   - Show scheduled meeting info on TopicCard
   - If SCHEDULED: "📅 Scheduled for Mon, Jan 6"
   - Click scheduled indicator → navigate to that meeting

6. Visual indicators on MeetingCard:
   - "Next" badge on the soonest upcoming meeting
   - Topic count: "2 topics" 
   - If IC has added topics: show "You added X topics"

7. Add to IC WorkspacePage right column layout:
   - Top: ICMeetingPanel
   - Bottom: Placeholder for ActionsPanel (coming later)

Test as IC user:
- Login as IC
- See meetings created by Leader
- Drag topic to a meeting
- See topic become scheduled
```

---

## Prompt 4.11 - Meeting Detail Page (Shared)

```
Continue building the 1:1 Companion app.

Create the Meeting Detail page accessible by both Leader and IC:

1. Create src/pages/MeetingPage.tsx:
   - Route: /meetings/:id
   - Fetch meeting using useMeeting(id) hook
   - Determine if current user is Leader or IC in this meeting
   - Show appropriate UI based on role

2. Page Header:
   - Back button:
     * If Leader: → /team/:icId
     * If IC: → /workspace
   - Date large: "Monday, January 6, 2025"
   - Time: "10:00 AM"
   - Title (editable for Leader)
   - Status badge: SCHEDULED | IN_PROGRESS | COMPLETED
   - For Leader only: "Complete Meeting" button (if not completed)

3. Two-column layout:
   - Left column (60%): Agenda (topics)
   - Right column (40%): Meeting Notes

4. Create src/components/meetings/MeetingAgenda.tsx:
   - Header: "Agenda" with topic count
   - List of AgendaItem components
   - Empty state: "No topics added yet. Drag topics here to build your agenda."
   - For both users: Can drag their own topics here to add
   - Drag to reorder topics (updates MeetingTopic.order)

5. Create src/components/meetings/AgendaItem.tsx:
   - Topic title (clickable to expand)
   - Label badge
   - Who added: "👤 You added" or "👥 [Name] added"
   - Expand/collapse arrow
   - Expanded view:
     * Topic content (BlockEditor readonly)
     * For Leader: "Create Action" button (for later)
   - Remove button (X):
     * Only visible for own topics OR if Leader
     * Calls DELETE /api/v1/meetings/:id/topics/:topicId
     * Returns topic to BACKLOG

6. Create src/components/meetings/MeetingNotes.tsx:
   - Header: "Meeting Notes"
   - BlockNote editor
   - Both Leader and IC can edit
   - Auto-save on change (debounced 1 second)
   - Last edited indicator: "Last edited by [Name] at [time]"

7. Implement Meeting Notes API:
   
   Add to src/routes/meetings.ts:
   
   - GET /api/v1/meetings/:id/notes
     * Return meeting notes content (JSON)
     * Return empty object if no notes yet
   
   - PUT /api/v1/meetings/:id/notes
     * Body: { content: JSON }
     * Upsert MeetingNote record
     * Track lastEditedById
     * Verify user is part of meeting relationship

8. Create src/hooks/useMeetingNotes.ts:
   - useMeetingNotes(meetingId) - fetch notes
   - useUpdateMeetingNotes(meetingId) - save notes

9. Add routes to App.tsx:
   - /meetings/:id → MeetingPage

10. Handle meeting status display:
    - SCHEDULED: Full editing, blue theme
    - IN_PROGRESS: Full editing, orange theme
    - COMPLETED: Read-only, green theme, show completion summary
    - CANCELLED: Show "This meeting was cancelled" message

Test viewing meeting from both Leader and IC login.
```

---

## Prompt 4.12 - Meeting Completion & Topic Resolution

```
Continue building the 1:1 Companion app.

Implement meeting completion flow (Leader only):

1. Create src/components/meetings/CompleteMeetingButton.tsx:
   - Only visible to Leader
   - Only visible if meeting status is SCHEDULED or IN_PROGRESS
   - Button: "Complete Meeting" (Wheatfield Orange)
   - Opens CompleteMeetingModal

2. Create src/components/meetings/CompleteMeetingModal.tsx:
   - Modal title: "Complete Meeting"
   - Subtitle: "Review each topic and select an outcome"
   - List all agenda topics with resolution selector
   - Footer: "Cancel" | "Complete Meeting" (disabled until all resolved)

3. Create src/components/meetings/TopicResolutionItem.tsx:
   - Topic title and label
   - Resolution radio buttons:
     * ✅ Done - "Topic is complete"
     * 📅 Next Meeting - "Discuss in next 1:1"
     * 📦 Archive - "No longer relevant"  
     * 🎯 Create Action - "Create follow-up action"
   - If "Create Action" selected, show inline form:
     * Title input (pre-filled with topic title)
     * Due date picker (default: 2 weeks from now)
     * Assigned to: Dropdown with Leader and IC names
     * Competency: Dropdown (optional, from competencies list)

4. Update POST /api/v1/meetings/:id/complete:
   - Body:
     ```json
     {
       "resolutions": [
         { 
           "meetingTopicId": "uuid", 
           "resolution": "DONE" 
         },
         { 
           "meetingTopicId": "uuid", 
           "resolution": "NEXT_MEETING" 
         },
         { 
           "meetingTopicId": "uuid", 
           "resolution": "CREATE_ACTION",
           "action": {
             "title": "Follow up on project timeline",
             "dueDate": "2025-01-20",
             "assignedToId": "uuid",
             "competencyId": "uuid or null"
           }
         }
       ]
     }
     ```
   
   - Process each resolution:
     * DONE: Set topic.status = DISCUSSED
     * NEXT_MEETING: 
       - Find next SCHEDULED meeting for this relationship
       - If exists: Create new MeetingTopic for next meeting
       - If not: Set topic.status = BACKLOG (will be picked up later)
     * ARCHIVE: Set topic.status = ARCHIVED
     * CREATE_ACTION: 
       - Create Action record with provided details
       - Set action.meetingId = this meeting
       - Set action.meetingTopicId = this topic
       - Set topic.status = DISCUSSED
   
   - Finally: Set meeting.status = COMPLETED
   - Return: { meeting, createdActions: [...] }

5. Create src/schemas/meeting.ts additions:
   - completeMeetingSchema with resolutions array validation

6. After successful completion:
   - Close modal
   - Show success toast: "Meeting completed. X actions created."
   - Redirect to /team/:icId (Leader) or /workspace (IC)
   - If actions created, they'll appear in Actions panel

7. Update MeetingPage for completed meetings:
   - Show completion summary at top
   - Show resolution for each topic (Done, Moved to Next, Archived, Action Created)
   - Notes still visible (read-only)
   - No edit capabilities

8. Create src/hooks/useCompleteMeeting.ts:
   - useCompleteMeeting(meetingId)
   - Mutation that handles the completion API call

Test completing a meeting with different resolution types.
```

---

## Prompt 4.13 - Actions Backend & Frontend

```
Continue building the 1:1 Companion app.

Implement the Actions feature:

**Backend (/api):**

1. Implement src/routes/actions.ts:
   
   - GET /api/v1/actions
     * Query params: ?ownerId, ?status, ?competencyId, ?icId (for Leaders)
     * For ICs: Return actions where ownerId = current user
     * For Leaders: Return actions where:
       - creatorId = current user, OR
       - ownerId is one of their ICs
     * If ?icId provided (Leader only): filter to that IC's actions
     * Include: competency name, meeting date, progress count
     * Sort by: dueDate ASC, then createdAt DESC

   - GET /api/v1/actions/:id
     * Full action details with description JSON
     * Include all progress updates (sorted by date)
     * Include source meeting info if linked
     * Verify user has access (owner, creator, or in relationship)

   - POST /api/v1/actions
     * Body: { title, description?, ownerId, dueDate, competencyId?, meetingId?, meetingTopicId? }
     * creatorId = current user
     * Verify ownerId is self or in relationship with current user
     * Status defaults to IN_PROGRESS

   - PUT /api/v1/actions/:id
     * Update: title, description, status, dueDate, competencyId
     * Only owner or creator can update
     * Status options: IN_PROGRESS, COMPLETED, CANCELLED

   - POST /api/v1/actions/:id/progress
     * Add progress update
     * Body: { note }
     * Anyone in the relationship can add
     * Creates ProgressUpdate record

   - DELETE /api/v1/actions/:id
     * Only creator can delete
     * Only if no progress updates exist
     * Otherwise, suggest marking as CANCELLED

2. Implement src/services/actionService.ts

3. Create src/schemas/action.ts

**Frontend (/web):**

4. Create src/components/actions/ActionPanel.tsx:
   - Header: "⚡ Actions"
   - Tabs: "Open" | "Completed" | "All"
   - For Leaders in IC workspace: shows that IC's actions
   - For ICs: shows their actions
   - List of ActionCard components
   - Empty state: "No actions yet"

5. Create src/components/actions/ActionCard.tsx:
   - Title
   - Due date with visual indicator:
     * Green: due in future
     * Orange: due within 3 days
     * Red: overdue
   - Status badge
   - Competency tag (if set)
   - Progress count: "3 updates"
   - Click → /actions/:id

6. Create src/pages/ActionPage.tsx:
   - Route: /actions/:id
   - Header:
     * Back button (context-aware)
     * Title (editable)
     * Status dropdown (IN_PROGRESS, COMPLETED, CANCELLED)
     * Due date (editable)
   - Competency badge
   - Source: "From meeting on [date]" with link (if from meeting)
   - Description: BlockEditor
   - Progress Timeline section
   - Add Progress form

7. Create src/components/actions/ProgressTimeline.tsx:
   - Vertical timeline of updates
   - Each update shows:
     * Date and time
     * Who added (avatar + name)
     * Note content
   - Most recent at top

8. Create src/components/actions/AddProgressForm.tsx:
   - Textarea for note
   - "Add Update" button
   - On submit: Create progress update, refresh timeline

9. Create src/hooks/useActions.ts:
   - useActions(filters)
   - useAction(id)
   - useCreateAction()
   - useUpdateAction()
   - useAddProgress()

10. Update workspaces to include ActionPanel:
    - IC WorkspacePage: Add ActionPanel below ICMeetingPanel
    - Leader ICWorkspacePage: Add ActionPanel below LeaderMeetingPanel

11. Add route:
    - /actions/:id → ActionPage

Test creating actions from meeting completion and adding progress updates.
```

---

# PHASE 6: Admin Portal

## Prompt 6.1 - Admin Layout & Navigation

```
Continue building the 1:1 Companion app.

Create the Admin Portal structure:

1. Create src/layouts/AdminLayout.tsx:
   - Similar structure to LeaderLayout
   - Sidebar with admin navigation
   - Header with "Admin Portal" title

2. Create src/pages/admin/AdminPage.tsx:
   - Route: /admin
   - Tabs navigation: Users | Relationships | Labels | Competencies | Import
   - Active tab indicator (Wheatfield Orange underline)
   - Content area below tabs

3. Create placeholder pages:
   - src/pages/admin/UsersTab.tsx
   - src/pages/admin/RelationshipsTab.tsx
   - src/pages/admin/LabelsTab.tsx
   - src/pages/admin/CompetenciesTab.tsx
   - src/pages/admin/ImportTab.tsx

4. Update App.tsx routes:
   - /admin → AdminPage (Admin only)
   - Redirect non-admins away from /admin

5. Update login redirect:
   - ADMIN role → /admin

Style the admin layout professionally.
```

---

## Prompt 6.2 - User Management

```
Continue building the 1:1 Companion app.

Implement User Management in Admin Portal:

**Backend (/api):**

1. Implement src/routes/admin/users.ts:
   - GET /api/v1/admin/users - list all users with pagination
   - GET /api/v1/admin/users/:id - get single user
   - POST /api/v1/admin/users - create user
   - PUT /api/v1/admin/users/:id - update user
   - DELETE /api/v1/admin/users/:id - deactivate (soft delete)
   - POST /api/v1/admin/users/:id/reset-password

2. Add admin middleware to verify ADMIN role

**Frontend (/web):**

3. Implement UsersTab.tsx:
   - Search input (filter by name/email)
   - Role filter dropdown
   - "Add User" button
   - Users table with: Name, Email, Role, Status, Actions
   - Pagination

4. Create CreateUserModal.tsx:
   - Form: Name, Email, Role, Temp Password
   - Create button

5. Create EditUserModal.tsx:
   - Edit name, role
   - Reset password button
   - Deactivate button

6. Create src/hooks/useAdminUsers.ts
```

---

## Prompt 6.3 - Relationship Management

```
Continue building the 1:1 Companion app.

Implement Relationship Management:

**Backend:**

1. Implement src/routes/admin/relationships.ts:
   - GET /api/v1/admin/relationships - list all
   - POST /api/v1/admin/relationships - create
   - DELETE /api/v1/admin/relationships/:id - remove

2. Validation: IC can only have one leader

**Frontend:**

3. Implement RelationshipsTab.tsx:
   - Table: Leader | IC | Created Date | Actions
   - "Add Relationship" button
   - Delete with confirmation

4. Create AddRelationshipModal.tsx:
   - Leader dropdown (users with LEADER role)
   - IC dropdown (users with IC role, no existing relationship)
```

---

## Prompt 6.4 - Labels & Competencies Management

```
Continue building the 1:1 Companion app.

Implement Labels and Competencies management:

**Backend:**

1. CRUD endpoints for Labels:
   - GET/POST/PUT/DELETE /api/v1/admin/labels

2. CRUD endpoints for Competencies:
   - GET/POST/PUT/DELETE /api/v1/admin/competencies

**Frontend:**

3. LabelsTab.tsx:
   - List of labels with color picker
   - Add/Edit/Delete

4. CompetenciesTab.tsx:
   - List of competencies with description
   - Add/Edit/Delete
```

---

## Prompt 6.5 - CSV Import Backend

```
Continue building the 1:1 Companion app.

Implement CSV import for bulk user creation:

**Backend:**

1. POST /api/v1/admin/import/users
   - Accept CSV file upload
   - Parse and validate rows
   - Create users in transaction
   - Return success/error summary

2. POST /api/v1/admin/import/relationships
   - Accept CSV with leader_email, ic_email columns
   - Create relationships
   - Return summary

3. Validation and error handling for each row
```

---

## Prompt 6.6 - CSV Import Frontend

```
Continue building the 1:1 Companion app.

**Frontend:**

1. ImportTab.tsx:
   - Two sections: Import Users, Import Relationships
   - File upload dropzone
   - Download template buttons
   - Preview parsed data before import
   - Import button
   - Results summary with errors

2. Create CSV templates for download

3. Show progress during import
```

---

# PHASE 7: Polish & Features

## Prompt 7.1 - Landing Page

```
Continue building the 1:1 Companion app.

Create a professional landing page:

1. Create src/pages/LandingPage.tsx:
   - Route: / (when not logged in)
   - Hero section with app name and tagline
   - Features section (3-4 cards)
   - "Sign In" button → /login
   - Wawanesa branding

2. Responsive design

3. Update routing:
   - / shows LandingPage if not authenticated
   - / redirects to role-appropriate page if authenticated
```

---

## Prompt 7.2 - Notifications System

```
Continue building the 1:1 Companion app.

Implement notifications:

**Backend:**

1. Notification routes:
   - GET /api/v1/notifications
   - PUT /api/v1/notifications/:id/read
   - PUT /api/v1/notifications/read-all
   - GET /api/v1/notifications/unread-count

2. Create notifications when:
   - Topic added to meeting
   - Action assigned
   - Progress update added

**Frontend:**

3. NotificationBell in header with unread count

4. NotificationPanel dropdown

5. Poll for new notifications every 30 seconds
```

---

## Prompt 7.3 - Growth Summary View

```
Continue building the 1:1 Companion app.

Implement Growth Summary for Leaders:

1. GET /api/v1/team/:icId/growth
   - Actions grouped by competency
   - Completion stats
   - Recent progress

2. GrowthPage.tsx at /team/:icId/growth:
   - Competency breakdown cards
   - Progress bars
   - Activity timeline

3. Add navigation from IC workspace
```

---

## Prompt 7.4 - Final Polish

```
Continue building the 1:1 Companion app.

Final polish:

1. Empty states for all lists
2. Loading skeletons
3. Error boundaries and toasts
4. Form validation feedback
5. Keyboard navigation
6. Mobile responsiveness
7. Accessibility (alt text, labels, contrast)
```

---

# PHASE 8: Testing & Deployment

## Prompt 8.1 - Testing Setup

```
Set up testing:

**Backend:**
- Jest + supertest
- Test auth, CRUD operations, meeting flow

**Frontend:**
- Vitest + Testing Library
- Component tests
```

---

## Prompt 8.2 - Deployment Preparation

```
Prepare for deployment:

1. Dockerfiles for api and web
2. docker-compose.yml
3. Production environment configs
4. Security checklist (CORS, rate limiting, etc.)
5. Health check endpoints
6. DEPLOYMENT.md documentation
```

---

# Summary: Complete Build Order

| Prompt | Description | Status |
|--------|-------------|--------|
| 1.1 - 4.5 | Setup through IC Thoughts & Topics | ✅ DONE |
| **4.6** | Team API + Leader Team View | ⏳ NEXT |
| **4.7** | Leader IC Workspace (Thoughts & Topics per IC) | |
| **4.8** | Schema Update + Meetings Backend API | |
| **4.9** | Leader Meeting Management (Frontend) | |
| **4.10** | IC Workspace: Meeting View | |
| **4.11** | Meeting Detail Page (Shared) | |
| **4.12** | Meeting Completion & Topic Resolution | |
| **4.13** | Actions Backend & Frontend | |
| 6.1 | Admin Layout & Navigation | |
| 6.2 | User Management | |
| 6.3 | Relationship Management | |
| 6.4 | Labels & Competencies | |
| 6.5 | CSV Import Backend | |
| 6.6 | CSV Import Frontend | |
| 7.1 | Landing Page | |
| 7.2 | Notifications | |
| 7.3 | Growth Summary | |
| 7.4 | Final Polish | |
| 8.1 | Testing Setup | |
| 8.2 | Deployment Prep | |
