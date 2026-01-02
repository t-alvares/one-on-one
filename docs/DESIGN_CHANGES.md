# Design Changes Log

This document tracks significant architectural and design decisions made during development.

---

## 2024-12-28: Leader Topic Panel - Backlog/Discussed Architecture

### Context

In the Leader's IC Workspace, we needed to show topics while respecting IC privacy. The initial implementation had "Mine", "Theirs", and "All" tabs showing all topics, which created several problems.

### Problem

1. **Privacy Violation**: Leaders could see IC's BACKLOG topics (drafts the IC wasn't ready to share)
2. **Confusing Mental Model**: "Mine/Theirs/All" tabs were redundant - "Mine" IS the working list
3. **SCHEDULED Topics Misplaced**: SCHEDULED topics belong in the meeting context, not the general topic panel
4. **No Clear History**: No dedicated view for topics that had been discussed (useful for year-end reviews)

### Solution

**Complete redesign with two clear tabs: Backlog and Discussed**

```
┌─────────────────────────────────────────────┐
│ Topics              [Backlog] [Discussed]   │
├─────────────────────────────────────────────┤
│ Backlog tab:                                │
│   ○ Topic I want to discuss                 │  ← Leader's working list
│   ○ Another thing to bring up               │  ← Editable, draggable
│   + Add topic                               │
├─────────────────────────────────────────────┤
│ Discussed tab:                              │
│   ○ Topic we covered last week              │  ← Historical record
│   ○ 👥 From IC: Their topic we discussed    │  ← IC's discussed topics
└─────────────────────────────────────────────┘
```

**Topic Lifecycle:**

```
BACKLOG (private working list)
    │
    ├── Leader's topics: Only Leader sees these
    │
    └── IC's topics: Private to IC (Leader never sees)

        ↓ add to meeting

SCHEDULED (lives in meeting context only)
    │
    └── Both parties can see topics on their shared meeting agenda

        ↓ meeting occurs

DISCUSSED (shared history)
    │
    └── Both Leader's AND IC's discussed topics appear here
        (Useful for end-of-year review)
```

### Implementation

**1. API Change** (`packages/api/src/services/topicService.ts`):

```typescript
// Counterparty topics: Only fetch DISCUSSED status
const counterpartyTopics = await prisma.topic.findMany({
  where: {
    userId: options.aboutIcId,
    aboutIcId: null,
    status: 'DISCUSSED', // Only topics that have been discussed
  },
  // ...
});
```

**2. Frontend Change** (`packages/web/src/components/leader/LeaderTopicPanel.tsx`):

- Changed from `FilterTab = 'all' | 'mine' | 'theirs'` to `FilterTab = 'backlog' | 'discussed'`
- Two separate queries:
  - Backlog: `status='BACKLOG', includeCounterparty=false`
  - Discussed: `status='DISCUSSED', includeCounterparty=true`
- Backlog tab: Full editing, drag-drop, add topic
- Discussed tab: Read-only historical view

### Privacy Model

| Topic Status | IC Can See | Leader Can See |
|--------------|------------|----------------|
| IC's BACKLOG | ✅ | ❌ Private |
| IC's SCHEDULED | ✅ | ❌ (In meeting only) |
| IC's DISCUSSED | ✅ | ✅ Shared history |
| Leader's BACKLOG | ✅ | ✅ Own topics |
| Leader's SCHEDULED | ✅ | ✅ (In meeting) |
| Leader's DISCUSSED | ✅ | ✅ Shared history |

### Benefits

1. **Maximum IC Privacy**: IC topics only visible after discussion
2. **Clear Mental Model**: Backlog = working list, Discussed = history
3. **SCHEDULED in Context**: Meeting agenda is where both parties see upcoming topics
4. **Year-End Reviews**: "Discussed" tab provides complete conversation history
5. **Simpler UI**: Two meaningful tabs instead of three redundant ones

### User Experience

**Backlog Tab (Default):**
- Leader's private working list of topics for this IC
- Can add, edit, delete, reorder topics
- Can drag thoughts from Thoughts panel to promote them
- IC never sees these topics

**Discussed Tab:**
- Read-only historical record
- Shows both Leader's and IC's discussed topics
- IC topics marked with "From [IC Name]"
- Useful for performance reviews, reflection

### Future Considerations

- Could add date/meeting reference to Discussed topics
- Could add filtering by date range in Discussed tab
- Could add export functionality for year-end summaries

---

## 2024-12-28: IC Topic Panel - Matching Backlog/Discussed Structure

### Context

After implementing the Backlog/Discussed tabs for the Leader's topic panel, we evaluated whether the IC's topic panel should have the same structure.

### Problem

1. **Inconsistent UI**: Leader had Backlog/Discussed tabs, IC had no tabs (just a flat list)
2. **Missing History**: When IC topics were marked as DISCUSSED, they "disappeared" from the IC's view
3. **No Year-End Review**: IC couldn't see their own discussion history for self-reflection

### Solution

**Added the same Backlog/Discussed tab structure to IC's TopicPanel**

```
┌─────────────────────────────────────────────┐
│ Topics              [Backlog] [Discussed]   │
├─────────────────────────────────────────────┤
│ Backlog tab:                                │
│   ○ Topic I want to discuss with my manager │
│   ○ Question about project timeline         │
│   + Add topic                               │
├─────────────────────────────────────────────┤
│ Discussed tab:                              │
│   ○ Career growth conversation              │
│   ○ Project feedback from last week         │
└─────────────────────────────────────────────┘
```

### Key Difference from Leader's Panel

| Panel | Backlog Tab | Discussed Tab |
|-------|-------------|---------------|
| **Leader** | Leader's topics only | Leader's + IC's discussed topics |
| **IC** | IC's topics only | IC's topics only (no Leader topics) |

The IC does **not** see the Leader's topics because:
- Leader's topics about the IC are the Leader's private notes
- This maintains the Leader's privacy to prepare discussion points

### Implementation

**Frontend Change** (`packages/web/src/components/topics/TopicPanel.tsx`):

- Added `FilterTab = 'backlog' | 'discussed'` type
- Two separate queries for BACKLOG and DISCUSSED statuses
- Backlog tab: Full editing capabilities
- Discussed tab: Read-only historical view
- Consistent UI with LeaderTopicPanel

### Benefits

1. **Consistent UX**: Same mental model for both IC and Leader
2. **History Access**: IC can review their own discussion history
3. **Self-Reflection**: Useful for IC's year-end reviews and growth tracking
4. **Feature Parity**: Both users get the same capabilities (within privacy boundaries)

---

## Template for Future Changes

### YYYY-MM-DD: [Change Title]

#### Context
[Describe the situation and why a change was needed]

#### Problem
[What specific issues were identified?]

#### Solution
[What architectural/design change was made?]

#### Implementation
[Key code changes - files modified and how]

#### Impact
[How does this affect users/behavior?]

#### Trade-offs
[Any downsides or considerations?]
