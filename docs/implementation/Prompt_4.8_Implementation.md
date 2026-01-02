# Prompt 4.8 - Schema Update & Meetings Backend API Implementation

**Completed:** 2026-01-01

## Summary

Implemented the Meetings Backend API with Leader ownership model. Meetings are created by Leaders, and ICs can view meetings where they are participants. The implementation includes full CRUD operations, recurring meeting generation, topic management, and meeting completion workflow.

## Changes Made

### Schema Changes

The schema was already updated in a previous session with migration `20251228165414_add_meeting_creator`:

**Meeting model additions:**
- `createdById String` - The Leader who created this meeting
- `createdBy User @relation("MeetingsCreated", ...)` - Relation to creator

**User model additions:**
- `meetingsCreated Meeting[] @relation("MeetingsCreated")` - Meetings created by this user

### Backend Changes

| File | Description |
|------|-------------|
| `packages/api/src/schemas/meeting.ts` | Validation schemas for all meeting operations (already existed) |
| `packages/api/src/services/meetingService.ts` | Enhanced: Fixed authorization, added `removeTopicFromMeetingByTopicId`, updated `listMeetings` to return `{upcoming, past}` structure |
| `packages/api/src/routes/meetings.ts` | Updated DELETE topics route to use `topicId` parameter |
| `packages/api/src/index.ts` | Routes already registered at `/api/v1/meetings` |

### Key Code Changes

**1. Fixed `removeTopicFromMeeting` authorization** (`meetingService.ts:570-616`)
```typescript
// Now properly verifies: user added this topic OR user is the Leader (creator)
const isTopicAdder = meetingTopic.addedById === userId;
const isLeader = meeting.createdById === userId;

if (!isTopicAdder && !isLeader) {
  throw ApiError.forbidden('Only the topic adder or meeting creator can remove topics');
}
```

**2. Added `removeTopicFromMeetingByTopicId` function** (`meetingService.ts:619-671`)
- Accepts `topicId` instead of `meetingTopicId`
- Uses composite unique key `meetingId_topicId` to find the MeetingTopic record

**3. Updated `listMeetings` response format** (`meetingService.ts:17-118`)
```typescript
return {
  upcoming: upcoming.map((m) => ({ ...m, isNext: nextMeeting?.id === m.id })),
  past: past.reverse(), // Most recent past first
};
```

**4. Updated DELETE route** (`meetings.ts:247-270`)
- Changed from `/:meetingId/topics/:meetingTopicId` to `/:id/topics/:topicId`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/meetings` | List meetings (separated into upcoming/past) | All |
| GET | `/api/v1/meetings/:id` | Get meeting with full details | All |
| POST | `/api/v1/meetings` | Create single meeting | Leader |
| POST | `/api/v1/meetings/generate` | Generate recurring meetings | Leader |
| PUT | `/api/v1/meetings/:id` | Update meeting (reschedule, rename) | Leader |
| DELETE | `/api/v1/meetings/:id` | Delete meeting (no topics, scheduled only) | Leader |
| POST | `/api/v1/meetings/:id/topics` | Add topic to meeting agenda | All |
| DELETE | `/api/v1/meetings/:id/topics/:topicId` | Remove topic from meeting | Topic adder or Leader |
| POST | `/api/v1/meetings/:id/complete` | Mark meeting as completed | Leader |
| POST | `/api/v1/meetings/:meetingId/notes` | Add note to meeting | All |

### Query Parameters (GET /meetings)

| Parameter | Type | Description |
|-----------|------|-------------|
| `icId` | UUID | Filter by IC (Leaders only) |
| `relationshipId` | UUID | Filter by relationship |
| `status` | MeetingStatus | Filter by status |
| `upcoming` | boolean | Filter upcoming/past |

### Response Format (GET /meetings)

```json
{
  "success": true,
  "data": {
    "upcoming": [
      {
        "id": "uuid",
        "scheduledAt": "2026-01-15T10:00:00Z",
        "title": "1:1 with Alex",
        "status": "SCHEDULED",
        "topicCount": 3,
        "isNext": true,
        "createdBy": { "id": "uuid", "name": "Sarah" },
        "relationship": {
          "id": "uuid",
          "leader": { "id": "uuid", "name": "Sarah" },
          "ic": { "id": "uuid", "name": "Alex" }
        }
      }
    ],
    "past": [...]
  }
}
```

## Key Features

- **Leader ownership**: Only Leaders can create, update, delete, and complete meetings
- **Recurring generation**: Generate weekly or biweekly meetings with one API call
- **Topic management**: Both parties can add topics; removal requires being the adder or the Leader
- **Upcoming/Past separation**: List endpoint automatically categorizes by date
- **Next meeting indicator**: `isNext: true` marks the soonest upcoming meeting
- **Deletion safeguards**: Can only delete scheduled meetings with no topics

## Validation Schemas

```typescript
// Create meeting
createMeetingSchema = z.object({
  icId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  title: z.string().min(1).max(200).trim().optional(),
});

// Generate recurring meetings
generateMeetingsSchema = z.object({
  icId: z.string().uuid(),
  frequency: z.enum(['weekly', 'biweekly']),
  dayOfWeek: z.number().int().min(0).max(6),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  count: z.number().int().min(1).max(52),
});

// Update meeting
updateMeetingSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  title: z.string().min(1).max(200).trim().optional(),
});

// Add topic
addMeetingTopicSchema = z.object({
  topicId: z.string().uuid(),
});
```

## Testing Notes

### Manual Testing with curl

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.manager@company.com","password":"password123"}' \
  | jq -r '.data.token')

# List meetings
curl -s http://localhost:3001/api/v1/meetings \
  -H "Authorization: Bearer $TOKEN" | jq

# Create a meeting
curl -s -X POST http://localhost:3001/api/v1/meetings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"icId":"<ic-uuid>","scheduledAt":"2026-01-15T10:00:00Z"}' | jq

# Generate weekly meetings
curl -s -X POST http://localhost:3001/api/v1/meetings/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"icId":"<ic-uuid>","frequency":"weekly","dayOfWeek":1,"time":"10:00","count":4}' | jq

# Get meeting detail
curl -s http://localhost:3001/api/v1/meetings/<meeting-id> \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Build Verification

```bash
cd packages/api && npx tsc --noEmit  # Passed
```

## Dependencies

No new dependencies added.

## Related Files

- `packages/api/prisma/schema.prisma` - Meeting model with createdById
- `packages/api/src/schemas/meeting.ts` - Zod validation schemas
- `packages/api/src/services/meetingService.ts` - Business logic
- `packages/api/src/routes/meetings.ts` - Express routes
