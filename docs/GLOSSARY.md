# Glossary

Consistent terminology for the 1:1 Companion application.

---

## Core Concepts

### Thought
A quick, private note captured by a user. Thoughts are fleeting ideas or reminders that the user wants to capture before they forget.

**Properties**:
- Always private to the creator
- Optional label/category
- Can be promoted to a Topic
- Deleted after promotion

**Example**: "Remember to ask about PTO policy"

---

### Topic
A refined discussion item ready for a 1:1 meeting. Topics live in a private backlog until added to a meeting.

**Properties**:
- Private until added to a meeting
- Has a title and optional notes
- Can have a label/category
- Can be moved between meetings and backlog

**States**:
| State | Description |
|-------|-------------|
| BACKLOG | In private backlog, not scheduled |
| SCHEDULED | Added to an upcoming meeting |
| DISCUSSED | Resolved in a completed meeting |
| ARCHIVED | Returned to backlog after meeting |

**Example**: "Career Growth: Discuss promotion timeline and skill development"

---

### Meeting (1:1)
A scheduled conversation between a Leader and an IC. Meetings have a shared agenda built from Topics.

**Properties**:
- Belongs to a specific Leader-IC relationship
- Has a scheduled date/time
- Contains topics added by both parties
- Can have notes captured during discussion

**States**:
| State | Description |
|-------|-------------|
| SCHEDULED | Upcoming meeting |
| IN_PROGRESS | Currently happening |
| COMPLETED | Meeting finished |
| CANCELLED | Meeting was cancelled |

---

### Meeting Topic
A Topic that has been added to a specific Meeting. This is the join between Topics and Meetings.

**Properties**:
- Links a Topic to a Meeting
- Records who added it (👤 me / 👥 them)
- Has an order for agenda sequencing
- Has a resolution after discussion

**Resolutions**:
| Resolution | Description | Result |
|------------|-------------|--------|
| DONE | Fully discussed | Topic archived |
| NEXT | Need more time | Added to next meeting |
| BACKLOG | Not the right time | Returns to backlog |
| ACTION | Created commitment | Action created |

---

### Action
A developmental commitment created from a 1:1 discussion. Actions track growth activities that aren't formal goals or work items.

**Properties**:
- Has an owner (who does it)
- Has a creator (who assigned it)
- Tagged with a competency
- Optional due date
- Tracks progress over time

**States**:
| State | Description |
|-------|-------------|
| NOT_STARTED | Created but not begun |
| IN_PROGRESS | Actively working on it |
| COMPLETED | Successfully finished |
| BLOCKED | Stuck, needs help |
| CANCELLED | No longer relevant |

**Example**: "Lead the Q1 planning discussion in team meeting"

---

### Progress Update
A note added to an Action to track progress. Both Leader and IC can add updates.

**Properties**:
- Belongs to an Action
- Has an author
- Timestamped
- Append-only (cannot edit/delete)

**Example**: "Dec 28: Draft agenda ready, scheduling practice run with Sarah"

---

### Label
A category tag for organizing Thoughts and Topics. Labels are company-wide and admin-configured.

**Properties**:
- Has a name and color
- Applied to Thoughts and Topics
- Helps with filtering and organization

**Default Labels**:
- Development (purple)
- Feedback (amber)
- Career (emerald)
- Projects (blue)
- Team (pink)
- Personal (indigo)

---

### Competency
A skill area from the company's competency framework. Used to categorize Actions and generate growth summaries.

**Properties**:
- Has a name and description
- Admin-configured
- Maps to company framework
- Used for tagging Actions

**Example Competencies**:
- Communication & Influence
- Technical Excellence
- Strategic Thinking
- Collaboration
- Customer Focus

---

## User Roles

### Individual Contributor (IC)
An employee who has 1:1s with their Leader. ICs see a single workspace for their relationship with their manager.

**Capabilities**:
- Capture thoughts and topics
- Add topics to upcoming meetings
- See shared meeting agendas
- Own and update actions
- View their growth summary

---

### Leader
A manager who has 1:1s with one or more ICs. Leaders can switch between IC workspaces.

**Capabilities**:
- All IC capabilities, per IC
- Select which IC to view
- Create and schedule meetings
- Create actions for ICs
- View growth summaries per IC

---

### Admin
A system administrator who manages users and settings.

**Capabilities**:
- Create and manage users
- Assign Leader-IC relationships
- Configure labels and competencies
- System settings

---

## Relationship Concepts

### Relationship
The formal link between a Leader and an IC. Each relationship has its own isolated workspace with separate thoughts, topics, meetings, and actions.

**Rules**:
- An IC has exactly one Leader
- A Leader can have many ICs
- No IC-to-IC or Leader-to-Leader relationships

---

### Workspace
The context for a specific Leader-IC relationship. Contains all data for that pairing.

**Contains**:
- Leader's thoughts (about this IC)
- IC's thoughts (about their Leader)
- Leader's topics (for this IC)
- IC's topics
- Shared meetings
- Shared actions

---

## UI Terminology

### Agenda
The list of topics scheduled for a specific meeting. Both parties contribute to the agenda.

### Backlog
The private list of topics not yet scheduled for any meeting.

### Growth Summary
An aggregate view showing actions completed by competency over time. Used for review preparation.

### Resolution
The outcome of discussing a topic in a meeting (Done, Next, Backlog, or Action).

---

## Notification Terminology

### Topic Added Notification
Sent when someone adds a topic to a shared meeting. This is the primary engagement driver.

"Jordan added 'Q1 project scope' to your Jan 6 1:1"

### Action Assigned Notification
Sent when an action is created with you as the owner.

"Jordan assigned you 'Document onboarding process'"

### Progress Update Notification
Sent when someone adds a progress update to an action you're involved with.

"Alex updated 'AWS certification': 60% complete"

---

## Technical Terminology

### JWT (JSON Web Token)
The authentication token used in MVP. Contains user ID and role, expires after 24 hours.

### Prisma
The ORM used for database access. Provides type-safe queries and migrations.

### SQLite / PostgreSQL
MVP uses SQLite (file-based), production will use PostgreSQL (AWS RDS).

### Cognito
AWS service for authentication. Will replace JWT in production for SSO support.

### Fargate
AWS service for running containers. Will host the application in production.
