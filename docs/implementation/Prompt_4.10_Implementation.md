# Prompt 4.10 - IC Workspace: Meeting View Implementation

**Completed:** 2026-01-01

## Summary
Implemented the IC Workspace Meeting View, enabling Individual Contributors to:
- View meetings created by their Leader
- See upcoming and past meetings with "Next Meeting" highlighted
- Drag and drop topics onto meetings to schedule them
- View scheduled meeting dates on topic cards
- Navigate to meetings by clicking scheduled date badges

## Changes Made

### Backend Changes
| File | Description |
|------|-------------|
| `packages/api/src/services/topicService.ts` | Extended `listTopics` to include `nextMeeting` info for SCHEDULED topics, using filtered `meetingTopics` include |

### Hook Changes
| File | Description |
|------|-------------|
| `packages/web/src/hooks/useMeetings.ts` | Added `useMyMeetings` hook for IC users, `MeetingWithNext` interface with `isNext` flag |
| `packages/web/src/hooks/useTopics.ts` | Added `NextMeetingInfo` interface and `nextMeeting` field to `Topic` interface |
| `packages/web/src/hooks/useLeaderTopics.ts` | Added `NextMeetingInfo` interface and `nextMeeting` field to Leader's `Topic` interface |

### Frontend Changes
| File | Description |
|------|-------------|
| `packages/web/src/components/ic/ICMeetingPanel.tsx` | New component showing IC's meetings with "Next Meeting", "Upcoming", and "Past" sections |
| `packages/web/src/components/ic/index.ts` | Export barrel file for IC components |
| `packages/web/src/components/meetings/MeetingCard.tsx` | Added `variant` prop ('leader'/'ic'), `showNextBadge` prop, hides actions for IC variant, shows Leader name for IC variant |
| `packages/web/src/components/topics/TopicPanel.tsx` | Added `onTopicDragStart` and `onTopicDragEnd` callbacks for cross-panel drag-drop communication |
| `packages/web/src/components/topics/TopicCard.tsx` | Updated to show scheduled meeting date (clickable) for SCHEDULED topics |
| `packages/web/src/components/leader/LeaderTopicCard.tsx` | Updated to show scheduled meeting date (clickable) for SCHEDULED topics |
| `packages/web/src/pages/ic/WorkspacePage.tsx` | Integrated ICMeetingPanel with drag-drop support and toast notifications |

## API Endpoints Used
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings` | List meetings for IC (no params needed) |
| GET | `/api/v1/topics?status=BACKLOG` | List IC's backlog topics with nextMeeting info |
| POST | `/api/v1/meetings/:id/topics` | Add topic to meeting |

## Key Features

### IC Meeting Panel
- Header: "Upcoming 1:1s" (no create button - ICs don't create meetings)
- "Next Meeting" section - single highlighted card with "Next" badge
- "Upcoming" section - collapsible, other upcoming meetings
- "Past" section - collapsed by default
- Empty state: "No meetings scheduled yet" / "Your leader will schedule your 1:1 meetings"
- Drop zone support for topic scheduling

### MeetingCard IC Variant
- Shows "with [Leader Name]" instead of generic title
- Hides reschedule/cancel actions (ICs can't modify meetings)
- "Next" badge on the highlighted next meeting
- Topic count badge
- Click navigates to meeting detail

### Topic Cards - Scheduled Info
- SCHEDULED topics show clickable date badge: "Mon, Jan 6"
- Clicking the date navigates to the meeting
- Works for both IC and Leader topic cards

### Drag and Drop
- BACKLOG topics can be dragged to upcoming SCHEDULED meetings
- Visual drop zone highlighting when dragging
- Toast notification on successful scheduling: "Topic added to meeting"
- Topic status updates to SCHEDULED after drop

## Data Flow

1. **IC Meetings**: `useMyMeetings()` fetches meetings with `isNext` flag marking the next upcoming meeting
2. **Topic List**: API returns `nextMeeting` object for SCHEDULED topics containing meeting ID and date
3. **Drop Handler**: WorkspacePage captures topic drag events and calls `useAddTopicToMeeting` mutation

## Testing Notes

To test the implementation:

1. Login as a Leader and generate meetings for an IC
2. Login as the IC
3. Navigate to IC Workspace
4. Verify meetings panel shows:
   - "Next Meeting" section with highlighted card
   - "Upcoming" section (if more meetings exist)
   - "Past" section (collapsed)
5. Create a topic in the Backlog
6. Drag the topic to an upcoming meeting
7. Verify toast: "Topic added to meeting"
8. Verify topic shows scheduled date badge
9. Click the date badge to navigate to meeting
10. Test empty state by using an IC with no meetings
