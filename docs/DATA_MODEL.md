# Data Model

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │ Relationship│       │    User     │
│  (Leader)   │──────▶│             │◀──────│    (IC)     │
└─────────────┘   1   └─────────────┘   1   └─────────────┘
                             │
                             │ 1
                             ▼
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Thought   │       │   Meeting   │       │   Topic     │
│  (private)  │       │             │       │  (private)  │
└─────────────┘       └─────────────┘       └─────────────┘
        │                    │                    │
        │                    │ n                  │
        │             ┌──────┴──────┐             │
        │             ▼             ▼             │
        │      ┌───────────┐ ┌───────────┐       │
        │      │  Meeting  │ │  Meeting  │       │
        │      │  Topic    │ │   Note    │       │
        │      └───────────┘ └───────────┘       │
        │             │                           │
        │             │ creates                   │
        │             ▼                           │
        │      ┌─────────────┐                   │
        │      │   Action    │                   │
        │      └─────────────┘                   │
        │             │                           │
        │             │ n                         │
        │             ▼                           │
        │      ┌─────────────┐                   │
        │      │  Progress   │                   │
        │      │   Update    │                   │
        │      └─────────────┘                   │
        │                                         │
        └────────────────┬────────────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │    Label    │
                  └─────────────┘

Supporting Entities:
┌─────────────┐       ┌─────────────┐
│ Competency  │       │Notification │
└─────────────┘       └─────────────┘
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed, will be removed when migrating to Cognito
  name      String
  role      Role     @default(IC)
  avatarUrl String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // IC Profile fields (populated via CSV import or manually)
  position        String?   // Job title, e.g., "Software Developer"
  yearsOfService  Float?    // Total years at company
  timeInPosition  Float?    // Years in current position
  importedAt      DateTime? // When imported via CSV (null if created manually)
  importedById    String?   // Leader ID who imported this IC

  // Relationships where this user is the Leader
  leaderRelationships Relationship[] @relation("LeaderRelationships")
  
  // Relationship where this user is the IC (should be only one)
  icRelationship Relationship? @relation("ICRelationship")
  
  // Thoughts created by this user
  thoughts Thought[]
  
  // Topics created by this user
  topics Topic[]
  
  // Meeting topics added by this user
  meetingTopicsAdded MeetingTopic[] @relation("AddedByUser")
  
  // Actions owned by this user
  actionsOwned Action[] @relation("ActionOwner")
  
  // Actions created by this user
  actionsCreated Action[] @relation("ActionCreator")
  
  // Progress updates by this user
  progressUpdates ProgressUpdate[]
  
  // Meeting notes by this user
  meetingNotes MeetingNote[]
  
  // Notifications for this user
  notifications Notification[]
  
  // Files uploaded by this user
  fileUploads FileUpload[]

  @@index([isActive])
  @@index([role])
}

enum Role {
  ADMIN
  LEADER
  IC
}

// ============================================
// LEADER-IC RELATIONSHIP
// ============================================

model Relationship {
  id        String   @id @default(uuid())
  leaderId  String
  icId      String   @unique  // IC can only have one Leader
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  leader User @relation("LeaderRelationships", fields: [leaderId], references: [id])
  ic     User @relation("ICRelationship", fields: [icId], references: [id])

  // All meetings for this relationship
  meetings Meeting[]

  @@unique([leaderId, icId])
  @@index([leaderId])
  @@index([icId])
}

// ============================================
// THOUGHTS (Always Private) - Block-Based Pages
// ============================================

model Thought {
  id        String   @id @default(uuid())
  title     String                          // Display title in list view
  content   Json     @default("[]")         // Block-based content (Tiptap JSON)
  userId    String
  labelId   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User   @relation(fields: [userId], references: [id])
  label Label? @relation(fields: [labelId], references: [id])

  // Context: which IC is this thought about (for Leaders)
  // If null, it's an IC's thought about their Leader
  aboutIcId String?

  @@index([userId])
  @@index([labelId])
  @@index([aboutIcId])
}

// ============================================
// TOPICS (Private until added to Meeting) - Block-Based Pages
// ============================================

model Topic {
  id        String      @id @default(uuid())
  title     String                          // Display title in list view
  content   Json        @default("[]")      // Block-based content (Tiptap JSON)
  userId    String
  labelId   String?
  status    TopicStatus @default(BACKLOG)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  user  User   @relation(fields: [userId], references: [id])
  label Label? @relation(fields: [labelId], references: [id])

  // When added to meetings
  meetingTopics MeetingTopic[]

  // Context: which IC is this topic about (for Leaders)
  aboutIcId String?

  @@index([userId])
  @@index([labelId])
  @@index([status])
  @@index([aboutIcId])
}

enum TopicStatus {
  BACKLOG    // In private backlog
  SCHEDULED  // Added to a meeting
  DISCUSSED  // Completed in a meeting
  ARCHIVED   // Moved back after meeting, no longer relevant
}

// ============================================
// MEETINGS (1:1 Sessions)
// ============================================

model Meeting {
  id             String        @id @default(uuid())
  relationshipId String
  scheduledAt    DateTime
  title          String?       // Optional custom title
  status         MeetingStatus @default(SCHEDULED)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  relationship Relationship @relation(fields: [relationshipId], references: [id])

  // Topics on this meeting's agenda
  topics MeetingTopic[]
  
  // Notes taken during meeting
  notes MeetingNote[]
  
  // Actions created from this meeting
  actions Action[]

  @@index([relationshipId])
  @@index([scheduledAt])
  @@index([status])
}

enum MeetingStatus {
  SCHEDULED  // Upcoming
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// ============================================
// MEETING TOPICS (Shared Agenda Items)
// ============================================

model MeetingTopic {
  id          String              @id @default(uuid())
  meetingId   String
  topicId     String
  addedById   String
  order       Int                 @default(0)  // For ordering in agenda
  resolution  TopicResolution?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  meeting Meeting @relation(fields: [meetingId], references: [id])
  topic   Topic   @relation(fields: [topicId], references: [id])
  addedBy User    @relation("AddedByUser", fields: [addedById], references: [id])

  // Action created from this topic (if resolution = ACTION)
  action Action?

  @@unique([meetingId, topicId])
  @@index([meetingId])
  @@index([topicId])
}

enum TopicResolution {
  DONE        // Discussed and resolved
  NEXT        // Move to next meeting
  BACKLOG     // Move back to backlog
  ACTION      // Created an action
}

// ============================================
// MEETING NOTES - Block-Based Content
// ============================================

model MeetingNote {
  id        String   @id @default(uuid())
  meetingId String
  authorId  String
  content   Json     @default("[]")         // Block-based content (Tiptap JSON)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  meeting Meeting @relation(fields: [meetingId], references: [id])
  author  User    @relation(fields: [authorId], references: [id])

  @@index([meetingId])
}

// ============================================
// ACTIONS (Growth Tasks) - Block-Based Description
// ============================================

model Action {
  id             String       @id @default(uuid())
  title          String
  description    Json         @default("[]")  // Block-based content (Tiptap JSON)
  ownerId        String       // Who is responsible
  creatorId      String       // Who created it
  meetingId      String?      // Which meeting it came from
  meetingTopicId String?      @unique  // Which topic it resolved
  competencyId   String?
  dueDate        DateTime?
  status         ActionStatus @default(NOT_STARTED)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  owner        User          @relation("ActionOwner", fields: [ownerId], references: [id])
  creator      User          @relation("ActionCreator", fields: [creatorId], references: [id])
  meeting      Meeting?      @relation(fields: [meetingId], references: [id])
  meetingTopic MeetingTopic? @relation(fields: [meetingTopicId], references: [id])
  competency   Competency?   @relation(fields: [competencyId], references: [id])

  // Progress updates on this action
  progressUpdates ProgressUpdate[]

  @@index([ownerId])
  @@index([creatorId])
  @@index([meetingId])
  @@index([competencyId])
  @@index([status])
}

enum ActionStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  BLOCKED
  CANCELLED
}

// ============================================
// PROGRESS UPDATES
// ============================================

model ProgressUpdate {
  id        String   @id @default(uuid())
  actionId  String
  authorId  String
  content   String
  createdAt DateTime @default(now())

  action Action @relation(fields: [actionId], references: [id])
  author User   @relation(fields: [authorId], references: [id])

  @@index([actionId])
  @@index([authorId])
}

// ============================================
// LABELS (Categories for Thoughts/Topics)
// ============================================

model Label {
  id        String   @id @default(uuid())
  name      String   @unique
  color     String   // Hex color
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  thoughts Thought[]
  topics   Topic[]
}

// ============================================
// COMPETENCIES (Company Framework)
// ============================================

model Competency {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  order       Int      @default(0)  // For display ordering
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  actions Action[]
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      String?          // JSON string for additional context
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([read])
  @@index([createdAt])
}

enum NotificationType {
  TOPIC_ADDED      // Someone added a topic to your shared meeting
  ACTION_ASSIGNED  // An action was assigned to you
  ACTION_UPDATED   // Progress update on an action
  MEETING_REMINDER // Upcoming meeting reminder
}

// ============================================
// FILE UPLOADS (for block editor images/files)
// ============================================

model FileUpload {
  id          String   @id @default(uuid())
  filename    String                        // Original filename
  storagePath String                        // Path in storage (S3 or local)
  mimeType    String                        // e.g., image/png, application/pdf
  size        Int                           // File size in bytes
  uploadedBy  String                        // User ID who uploaded
  createdAt   DateTime @default(now())

  user User @relation(fields: [uploadedBy], references: [id])

  @@index([uploadedBy])
}
```

---

## Entity Details

### User

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique, for login |
| password | String | Hashed (remove for Cognito) |
| name | String | Display name |
| role | Enum | ADMIN, LEADER, IC |
| avatarUrl | String? | Profile image URL |

**Business Rules**:
- Email must be unique
- A user can be both a Leader (has ICs) and an IC (has a Leader) — but for MVP, roles are exclusive
- Admins can manage all users

### Relationship

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| leaderId | UUID | FK to User (Leader) |
| icId | UUID | FK to User (IC), unique |

**Business Rules**:
- An IC can only have ONE Leader (enforced by unique icId)
- A Leader can have MANY ICs
- Deleting a relationship orphans all related data (consider soft delete)

### Thought

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Display title shown in list view |
| content | Json | Block-based content (Tiptap JSON array) |
| userId | UUID | Who created it |
| labelId | UUID? | Optional category |
| aboutIcId | UUID? | For Leaders: which IC context |

**Content Structure** (Tiptap JSON):
```json
[
  { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Discussion Points" }] },
  { "type": "paragraph", "content": [{ "type": "text", "text": "Main content here..." }] },
  { "type": "bulletList", "content": [
    { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Point 1" }] }] }
  ]},
  { "type": "image", "attrs": { "src": "/uploads/xxx.png", "alt": "Description" } }
]
```

**Business Rules**:
- Always private to the creator
- Cannot be shared directly (must become a Topic first)
- For Leaders, thoughts are contextual per IC
- Title is required; content can be empty initially
- Supports rich content: headings, lists, images, files, etc.

### Topic

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Display title shown in list view |
| content | Json | Block-based content (Tiptap JSON array) |
| userId | UUID | Who created it |
| labelId | UUID? | Optional category |
| status | Enum | BACKLOG, SCHEDULED, DISCUSSED, ARCHIVED |
| aboutIcId | UUID? | For Leaders: which IC context |

**Business Rules**:
- Private until added to a Meeting via MeetingTopic
- Status changes based on lifecycle
- Can be reused across multiple meetings
- Full page with rich content when opened
- Title shown in lists; full content in page view

### Meeting

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| relationshipId | UUID | Which Leader-IC pair |
| scheduledAt | DateTime | When the meeting is |
| title | String? | Optional custom title |
| status | Enum | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED |

**Business Rules**:
- Belongs to exactly one Relationship
- Past meetings are read-only (for history)
- Topics can only be added to SCHEDULED meetings

### MeetingTopic

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| meetingId | UUID | Which meeting |
| topicId | UUID | Which topic |
| addedById | UUID | Who added it |
| order | Int | Display order in agenda |
| resolution | Enum? | DONE, NEXT, BACKLOG, ACTION |

**Business Rules**:
- Unique combination of meetingId + topicId
- Adding triggers notification to other party
- Resolution is set during/after the meeting

### Action

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | What needs to be done |
| description | Json | Block-based content (Tiptap JSON array) |
| ownerId | UUID | Who is responsible |
| creatorId | UUID | Who created it |
| meetingId | UUID? | Origin meeting |
| meetingTopicId | UUID? | Origin topic |
| competencyId | UUID? | Tagged competency |
| dueDate | DateTime? | Target date |
| status | Enum | NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED, CANCELLED |

**Business Rules**:
- Owner and creator can both be Leader or IC
- Competency tagging enables growth summaries
- Links back to originating meeting/topic for context
- Description supports rich content with block editor

### ProgressUpdate

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| actionId | UUID | Which action |
| authorId | UUID | Who wrote it |
| content | String | Update text |

**Business Rules**:
- Both Leader and IC can add updates
- Chronological, append-only
- Provides evidence trail

### Label

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Label name (unique) |
| color | String | Hex color code |

**Business Rules**:
- Admin-configured, company-wide
- Used for categorizing Thoughts and Topics
- Examples: "Development", "Feedback", "Career", "Projects"

### Competency

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Competency name (unique) |
| description | String? | What it means |
| order | Int | Display order |

**Business Rules**:
- Admin-configured, company-wide
- Maps to company's competency framework
- Used for tagging Actions
- Enables growth summary reports

### Notification

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Recipient |
| type | Enum | TOPIC_ADDED, ACTION_ASSIGNED, etc. |
| title | String | Notification title |
| message | String | Notification body |
| data | String? | JSON for deep linking |
| read | Boolean | Has been seen |

**Business Rules**:
- Created automatically on certain events
- Unread notifications show badge
- Click navigates to relevant area

---

## Indexes Strategy

Primary indexes are on:
- All foreign keys (for joins)
- Status fields (for filtering)
- Timestamps (for ordering)
- `aboutIcId` (for Leader context filtering)

---

## Migration Path: SQLite → PostgreSQL

1. Change `provider` in schema.prisma
2. Update `DATABASE_URL` environment variable
3. Run `npx prisma migrate deploy`
4. No application code changes required (Prisma handles it)

```prisma
// Before (SQLite)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// After (PostgreSQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
