# Product Overview

## Vision

**1:1 Companion** is an internal tool that transforms scattered, inconsistent 1:1 meetings into meaningful, ongoing development conversations between Leaders and Individual Contributors.

### The Problem

Today, 1:1 preparation and follow-through is fragmented:
- Leaders and ICs use disparate tools (OneNote, Confluence, Excel, Notepad)
- Valuable thoughts get lost between meetings
- No shared view of topics or commitments
- Annual reviews lack concrete evidence of growth
- Enterprise tools (SuccessFactors, JIRA) serve formal goals and work items, not developmental micro-actions

### The Solution

A unified workspace where:
- Both parties capture thoughts privately throughout the week
- Topics are intentionally promoted and scheduled
- 1:1 meetings have shared agendas built by both sides
- Actions emerge from conversations and track real growth
- Evidence of development accumulates over time

---

## Core Concepts

### The Privacy Progression

```
PRIVATE                          SHARED
───────────────────────────────────────────────►

Thoughts → Topics → Meeting Agenda → Actions
   │          │           │             │
   │          │           │             └── Both see, both update
   │          │           └── Visible when topic added to meeting
   │          └── Private until scheduled
   └── Always private, quick capture
```

### Key Principle: Intentional Sharing

Nothing is shared until explicitly placed on a meeting agenda. This creates psychological safety:
- Dump raw thoughts without judgment
- Refine into topics at your own pace
- Share only when ready to discuss

---

## User Types

### 1. Individual Contributor (IC)

**Who**: An employee with a direct manager (Leader)

**Their View**:
- Single 1:1 workspace with their Leader
- Private thoughts and topics areas
- Upcoming and past meetings with their Leader
- Their assigned actions
- Notifications when Leader adds topics

**Key Jobs**:
- Capture thoughts during the week
- Promote important items to topics
- Add topics to upcoming meetings
- Update progress on actions

### 2. Leader

**Who**: A manager with one or more direct reports (ICs)

**Their View**:
- Employee selector to switch between IC workspaces
- For each IC: full 1:1 workspace view
- Private thoughts and topics (per IC context)
- Meeting management and scheduling
- Actions assigned to/by each IC
- Notifications when any IC adds topics

**Key Jobs**:
- Maintain 1:1 schedules per IC
- Capture thoughts per IC relationship
- Build meeting agendas collaboratively
- Create developmental actions
- Track growth across competencies

### 3. Admin

**Who**: System administrator (could be HR, IT, or a Leader)

**Their View**:
- User management (create Leaders, ICs)
- Leader ↔ IC relationship assignments
- Competency framework configuration
- Label/category management
- System settings

**Key Jobs**:
- Onboard new users
- Manage reporting relationships
- Configure company-specific settings
- Monitor system health

---

## Relationship Model

```
┌─────────────┐         ┌─────────────┐
│   Leader    │ 1     n │     IC      │
│             │─────────│             │
│  (has many  │         │ (has one    │
│    ICs)     │         │   Leader)   │
└─────────────┘         └─────────────┘
       │                       │
       │                       │
       ▼                       ▼
┌─────────────────────────────────────┐
│         1:1 Relationship            │
│  (one workspace per Leader-IC pair) │
└─────────────────────────────────────┘
```

**Rules**:
- Leader ↔ IC relationships only (never IC ↔ IC or Leader ↔ Leader)
- One Leader per IC (for MVP; multi-manager could be V2)
- A Leader can have many ICs
- Each relationship has its own isolated workspace

---

## Information Architecture

### For IC

```
My Workspace
├── 📝 My Thoughts (private)
├── 📌 My Topics (private backlog)
├── 📅 My 1:1s
│   ├── Upcoming (shared agenda)
│   └── Past (history)
└── ⚡ My Actions (shared)
```

### For Leader

```
1:1 Companion
├── 👥 My Team
│   ├── [IC Name 1] → opens their workspace
│   ├── [IC Name 2] → opens their workspace
│   └── [IC Name 3] → opens their workspace
│
└── [Selected IC Workspace]
    ├── 📝 My Thoughts (Leader's private, for this IC)
    ├── 📌 My Topics (Leader's private backlog, for this IC)
    ├── 📅 Our 1:1s
    │   ├── Upcoming
    │   └── Past
    └── ⚡ Actions (shared)
```

### For Admin

```
Admin Portal
├── 👤 Users
│   ├── Leaders
│   └── Individual Contributors
├── 🔗 Relationships
│   └── Leader ↔ IC assignments
├── 🏷️ Labels
│   └── Category configuration
├── 🎯 Competencies
│   └── Company competency framework
└── ⚙️ Settings
    └── System configuration
```

---

## Core Workflows

### 1. Weekly Thought Capture

```
Mon-Fri: Random moment
         │
         ▼
┌─────────────────────────┐
│ Quick thought appears   │
│ "Should discuss X..."   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Open app → Thoughts     │
│ Type quickly, hit enter │
│ Optional: add label     │
└─────────────────────────┘
         │
         ▼
    Thought saved
    (private, safe)
```

### 2. Pre-Meeting Prep

```
Day before 1:1
         │
         ▼
┌─────────────────────────┐
│ Review thoughts         │
│ "This one is important" │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Promote to Topic        │
│ (still private)         │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Drag topic to           │
│ upcoming 1:1            │
└─────────────────────────┘
         │
         ▼
   🔔 Other party notified
   Topic now visible to them
```

### 3. During the 1:1

```
Meeting starts
         │
         ▼
┌─────────────────────────┐
│ Leader shares screen    │
│ Both see shared agenda  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Walk through topics     │
│ Discuss each one        │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ For each topic:         │
│ ○ Done / Discussed      │
│ ○ Move to next 1:1      │
│ ○ Back to backlog       │
│ ○ Create Action         │
└─────────────────────────┘
         │
         ▼
   Meeting complete
   History preserved
```

### 4. Action Tracking

```
Action created from 1:1
         │
         ▼
┌─────────────────────────┐
│ Action appears in       │
│ shared Actions area     │
│ Tagged with competency  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Owner adds progress     │
│ updates throughout      │
│ the week                │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Review in next 1:1      │
│ Mark complete or        │
│ continue tracking       │
└─────────────────────────┘
         │
         ▼
   Evidence accumulates
   Growth summary builds
```

---

## What This Is NOT

| This App | Not This App |
|----------|--------------|
| Developmental micro-actions | Formal performance goals (SuccessFactors) |
| Weekly growth reps | Project work items (JIRA) |
| Safe space to experiment | Official HR record |
| Continuous, lightweight | Annual review process |
| Co-created by Leader + IC | Top-down mandated |

---

## Success Metrics (Pilot)

### Engagement
- Thoughts captured per user per week
- Topics created from thoughts (conversion rate)
- Topics added to meetings (intent to discuss)
- Actions created from 1:1s

### Quality
- Subjective: Do 1:1s feel more meaningful?
- Are actions being tracked and completed?
- Is evidence being generated for reviews?

### Adoption
- Active users after 4 weeks
- Return rate (weekly usage)
- Feature utilization across the system

---

## Future Considerations (V2+)

- Outlook calendar integration for 1:1 scheduling
- AWS Cognito SSO integration
- SuccessFactors competency sync
- Mobile app (native)
- Real-time collaborative meeting notes
- AI-suggested topics based on action progress
- Team-level growth analytics for Leaders
- Export to SuccessFactors for review evidence
