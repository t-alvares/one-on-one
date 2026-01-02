# API Specification

## Base URL

```
Development: http://localhost:3001/api/v1
Production:  https://api.yourcompany.com/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

---

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "name": "Alex Chen",
      "role": "IC",
      "avatarUrl": null
    }
  }
}
```

**Errors:**
- `INVALID_CREDENTIALS`: Email or password incorrect
- `ACCOUNT_DISABLED`: Account has been deactivated

---

#### POST /auth/logout
Logout current user (invalidate token if using token blacklist).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

#### GET /auth/me
Get current authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@company.com",
    "name": "Alex Chen",
    "role": "IC",
    "avatarUrl": null,
    "relationship": {
      "id": "uuid",
      "leader": {
        "id": "uuid",
        "name": "Jordan Smith"
      }
    }
  }
}
```

---

### Users (Admin Only)

#### GET /admin/users
List all users.

**Query Parameters:**
- `role` (optional): Filter by role (ADMIN, LEADER, IC)
- `search` (optional): Search by name or email
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@company.com",
      "name": "Alex Chen",
      "role": "IC",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

#### POST /admin/users
Create a new user.

**Request:**
```json
{
  "email": "newuser@company.com",
  "name": "New User",
  "role": "IC",
  "password": "tempPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@company.com",
    "name": "New User",
    "role": "IC"
  }
}
```

---

#### PUT /admin/users/:id
Update a user.

**Request:**
```json
{
  "name": "Updated Name",
  "role": "LEADER"
}
```

---

#### DELETE /admin/users/:id
Deactivate a user (soft delete).

---

### Relationships (Admin Only)

#### GET /admin/relationships
List all Leader-IC relationships.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "leader": {
        "id": "uuid",
        "name": "Jordan Smith"
      },
      "ic": {
        "id": "uuid",
        "name": "Alex Chen"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### POST /admin/relationships
Create a Leader-IC relationship.

**Request:**
```json
{
  "leaderId": "uuid",
  "icId": "uuid"
}
```

**Errors:**
- `IC_ALREADY_ASSIGNED`: This IC already has a Leader
- `INVALID_LEADER`: User is not a Leader
- `INVALID_IC`: User is not an IC

---

#### DELETE /admin/relationships/:id
Remove a relationship.

---

### Team (Leader Only)

#### GET /team
Get Leader's team (ICs).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Alex Chen",
      "email": "alex@company.com",
      "avatarUrl": null,
      "relationshipId": "uuid",
      "upcomingMeetingCount": 2,
      "pendingActionCount": 3
    }
  ]
}
```

---

### Thoughts

#### GET /thoughts
Get current user's thoughts (list view - titles only).

**Query Parameters:**
- `labelId` (optional): Filter by label
- `aboutIcId` (optional, Leaders only): Filter by IC context

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Career growth discussion",
      "label": {
        "id": "uuid",
        "name": "Development",
        "color": "#003A5C"
      },
      "createdAt": "2024-12-20T14:30:00Z",
      "updatedAt": "2024-12-20T15:00:00Z"
    }
  ]
}
```

---

#### GET /thoughts/:id
Get a single thought with full block content.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Career growth discussion",
    "content": [
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "What I want to discuss" }] },
      { "type": "paragraph", "content": [{ "type": "text", "text": "I've been thinking about my promotion..." }] },
      { "type": "taskList", "content": [
        { "type": "taskItem", "attrs": { "checked": true }, "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Skills to develop" }] }] },
        { "type": "taskItem", "attrs": { "checked": false }, "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Timeline expectations" }] }] }
      ]},
      { "type": "blockquote", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Growth happens at the edge of your comfort zone" }] }] },
      { "type": "image", "attrs": { "src": "/api/v1/uploads/xxx.png", "alt": "Career ladder" } }
    ],
    "label": {
      "id": "uuid",
      "name": "Development",
      "color": "#003A5C"
    },
    "createdAt": "2024-12-20T14:30:00Z",
    "updatedAt": "2024-12-20T15:00:00Z"
  }
}
```

---

#### POST /thoughts
Create a thought.

**Request:**
```json
{
  "title": "Career growth discussion",
  "content": [],
  "labelId": "uuid",
  "aboutIcId": "uuid"
}
```

---

#### PUT /thoughts/:id
Update a thought (title, content, or label).

**Request:**
```json
{
  "title": "Updated title",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "Updated content..." }] }
  ],
  "labelId": "uuid"
}
```

---

#### DELETE /thoughts/:id
Delete a thought.

---

#### POST /thoughts/:id/promote
Promote a thought to a topic (copies title and all content).

**Request:**
```json
{
  "labelId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": {
      "id": "uuid",
      "title": "Career growth discussion",
      "status": "BACKLOG"
    },
    "thoughtDeleted": true
  }
}
```

---

### Topics

#### GET /topics
Get current user's topics (list view - titles only).

**Query Parameters:**
- `status` (optional): Filter by status (BACKLOG, SCHEDULED, DISCUSSED)
- `labelId` (optional): Filter by label
- `aboutIcId` (optional, Leaders only): Filter by IC context

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Career growth discussion",
      "status": "BACKLOG",
      "label": {
        "id": "uuid",
        "name": "Development",
        "color": "#003A5C"
      },
      "createdAt": "2024-12-18T10:00:00Z",
      "updatedAt": "2024-12-20T09:00:00Z"
    }
  ]
}
```

---

#### GET /topics/:id
Get a single topic with full block content.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Career growth discussion",
    "content": [
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Context" }] },
      { "type": "paragraph", "content": [{ "type": "text", "text": "I've been in my current role for 18 months..." }] },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Questions to ask" }] },
      { "type": "taskList", "content": [
        { "type": "taskItem", "attrs": { "checked": false }, "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "What does success look like at the next level?" }] }] }
      ]}
    ],
    "status": "BACKLOG",
    "label": {
      "id": "uuid",
      "name": "Development",
      "color": "#003A5C"
    },
    "createdAt": "2024-12-18T10:00:00Z",
    "updatedAt": "2024-12-20T09:00:00Z"
  }
}
```

---

#### POST /topics
Create a topic.

**Request:**
```json
{
  "title": "Career growth discussion",
  "content": [],
  "labelId": "uuid",
  "aboutIcId": "uuid"
}
```

---

#### PUT /topics/:id
Update a topic (title, content, or label).

**Request:**
```json
{
  "title": "Updated title",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "Updated content..." }] }
  ],
  "labelId": "uuid"
}
```
      },
      "createdAt": "2024-12-18T10:00:00Z"
    }
  ]
}
```

---

#### POST /topics
Create a topic.

**Request:**
```json
{
  "title": "Career growth discussion",
  "notes": "Want to talk about promotion timeline",
  "labelId": "uuid",
  "aboutIcId": "uuid"  // Optional, for Leaders
}
```

---

#### PUT /topics/:id
Update a topic.

---

#### DELETE /topics/:id
Delete a topic (only if status = BACKLOG).

---

### Meetings

#### GET /meetings
Get meetings for a relationship.

**Query Parameters:**
- `relationshipId` (required for Leaders): Which IC's meetings
- `status` (optional): SCHEDULED, COMPLETED, CANCELLED
- `upcoming` (optional): true = future only, false = past only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "scheduledAt": "2024-12-23T14:00:00Z",
      "title": "Weekly 1:1",
      "status": "SCHEDULED",
      "topicCount": 3,
      "relationship": {
        "id": "uuid",
        "leader": { "id": "uuid", "name": "Jordan Smith" },
        "ic": { "id": "uuid", "name": "Alex Chen" }
      }
    }
  ]
}
```

---

#### POST /meetings
Create a meeting (Leader only).

**Request:**
```json
{
  "relationshipId": "uuid",
  "scheduledAt": "2024-12-23T14:00:00Z",
  "title": "Weekly 1:1"
}
```

---

#### GET /meetings/:id
Get meeting detail with topics.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "scheduledAt": "2024-12-23T14:00:00Z",
    "title": "Weekly 1:1",
    "status": "SCHEDULED",
    "topics": [
      {
        "id": "uuid",
        "meetingTopicId": "uuid",
        "title": "Career growth",
        "notes": "...",
        "label": { ... },
        "addedBy": {
          "id": "uuid",
          "name": "Alex Chen",
          "isCurrentUser": true
        },
        "resolution": null,
        "order": 0
      }
    ],
    "notes": [
      {
        "id": "uuid",
        "content": "Discussed promotion timeline...",
        "author": { "id": "uuid", "name": "Jordan Smith" },
        "createdAt": "2024-12-23T14:30:00Z"
      }
    ],
    "actions": [ ... ]
  }
}
```

---

#### PUT /meetings/:id
Update meeting (reschedule, rename).

---

#### POST /meetings/:id/complete
Mark meeting as complete.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "unresolvedTopics": 0
  }
}
```

---

### Meeting Topics

#### POST /meetings/:meetingId/topics
Add a topic to a meeting.

**Request:**
```json
{
  "topicId": "uuid"
}
```

**Side Effects:**
- Topic status → SCHEDULED
- Notification sent to other party

---

#### PUT /meetings/:meetingId/topics/:meetingTopicId
Update meeting topic (reorder, resolve).

**Request:**
```json
{
  "order": 2,
  "resolution": "DONE"
}
```

---

#### DELETE /meetings/:meetingId/topics/:meetingTopicId
Remove a topic from a meeting.

**Side Effects:**
- Topic status → BACKLOG (if no other meetings)

---

### Meeting Notes

#### POST /meetings/:meetingId/notes
Add a note to a meeting.

**Request:**
```json
{
  "content": "Discussed promotion timeline, targeting Q2."
}
```

---

### Actions

#### GET /actions
Get actions.

**Query Parameters:**
- `ownerId` (optional): Filter by owner
- `status` (optional): Filter by status
- `competencyId` (optional): Filter by competency
- `relationshipId` (optional, Leaders): Filter by IC

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Lead Q1 planning discussion",
      "description": "...",
      "owner": { "id": "uuid", "name": "Alex Chen" },
      "creator": { "id": "uuid", "name": "Jordan Smith" },
      "competency": { "id": "uuid", "name": "Communication & Influence" },
      "status": "IN_PROGRESS",
      "dueDate": "2025-01-15T00:00:00Z",
      "meeting": { "id": "uuid", "scheduledAt": "2024-12-23T14:00:00Z" },
      "progressCount": 3,
      "createdAt": "2024-12-23T14:45:00Z"
    }
  ]
}
```

---

#### POST /actions
Create an action.

**Request:**
```json
{
  "title": "Lead Q1 planning discussion",
  "description": "Practice presenting to the team",
  "ownerId": "uuid",
  "competencyId": "uuid",
  "dueDate": "2025-01-15",
  "meetingId": "uuid",
  "meetingTopicId": "uuid"
}
```

---

#### GET /actions/:id
Get action detail with progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Lead Q1 planning discussion",
    "description": "...",
    "owner": { ... },
    "creator": { ... },
    "competency": { ... },
    "status": "IN_PROGRESS",
    "dueDate": "2025-01-15T00:00:00Z",
    "meeting": { ... },
    "topic": { "id": "uuid", "title": "Career growth" },
    "progress": [
      {
        "id": "uuid",
        "content": "Started prepping the agenda",
        "author": { "id": "uuid", "name": "Alex Chen" },
        "createdAt": "2024-12-23T16:00:00Z"
      }
    ]
  }
}
```

---

#### PUT /actions/:id
Update an action.

**Request:**
```json
{
  "status": "COMPLETED",
  "dueDate": "2025-01-20"
}
```

---

### Progress Updates

#### POST /actions/:actionId/progress
Add a progress update.

**Request:**
```json
{
  "content": "Completed the dry run, feeling confident!"
}
```

---

### Labels (Admin)

#### GET /admin/labels
List all labels.

#### POST /admin/labels
Create a label.

**Request:**
```json
{
  "name": "Development",
  "color": "#8B5CF6"
}
```

#### PUT /admin/labels/:id
Update a label.

#### DELETE /admin/labels/:id
Delete a label.

---

### Competencies (Admin)

#### GET /admin/competencies
List all competencies.

#### POST /admin/competencies
Create a competency.

**Request:**
```json
{
  "name": "Communication & Influence",
  "description": "Ability to articulate ideas clearly..."
}
```

#### PUT /admin/competencies/:id
Update a competency.

#### PUT /admin/competencies/reorder
Reorder competencies.

**Request:**
```json
{
  "order": ["uuid1", "uuid2", "uuid3"]
}
```

#### DELETE /admin/competencies/:id
Delete a competency.

---

### Notifications

#### GET /notifications
Get current user's notifications.

**Query Parameters:**
- `unreadOnly` (optional): true = unread only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "TOPIC_ADDED",
      "title": "New topic added",
      "message": "Alex added 'Career growth' to your Dec 23 1:1",
      "data": {
        "meetingId": "uuid",
        "topicId": "uuid"
      },
      "read": false,
      "createdAt": "2024-12-20T10:30:00Z"
    }
  ]
}
```

---

#### PUT /notifications/:id/read
Mark notification as read.

---

#### PUT /notifications/read-all
Mark all notifications as read.

---

### Growth Summary

#### GET /growth-summary
Get growth summary for a user.

**Query Parameters:**
- `userId` (optional, Leaders): Which IC
- `startDate` (optional): Period start
- `endDate` (optional): Period end

**Response:**
```json
{
  "success": true,
  "data": {
    "totalActions": 34,
    "completedActions": 28,
    "byCompetency": [
      {
        "competency": { "id": "uuid", "name": "Communication & Influence" },
        "total": 12,
        "completed": 10
      },
      {
        "competency": { "id": "uuid", "name": "Technical Excellence" },
        "total": 8,
        "completed": 7
      }
    ],
    "recentHighlights": [
      {
        "id": "uuid",
        "title": "Led Q1 planning discussion",
        "competency": "Communication & Influence",
        "completedAt": "2025-01-10T00:00:00Z"
      }
    ]
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for this action |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `ACCOUNT_DISABLED` | 403 | Account has been deactivated |
| `IC_ALREADY_ASSIGNED` | 400 | IC already has a Leader |
| `TOPIC_ALREADY_SCHEDULED` | 400 | Topic is already on a meeting |
| `MEETING_COMPLETED` | 400 | Cannot modify completed meeting |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

For MVP, no rate limiting. For production:
- 100 requests per minute per user
- 1000 requests per minute per IP

---

## File Uploads

### POST /uploads
Upload a file (image or attachment for block editor).

**Request:** `multipart/form-data`
- `file`: The file to upload

**Constraints:**
- Images: max 10MB, formats: PNG, JPG, GIF, WebP
- Files: max 25MB, formats: PDF, DOC, DOCX, XLS, XLSX, TXT

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "/api/v1/uploads/uuid/filename.png",
    "filename": "career-ladder.png",
    "mimeType": "image/png",
    "size": 245678
  }
}
```

**Errors:**
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: File type not allowed

---

### GET /uploads/:id/:filename
Retrieve an uploaded file.

**Response:** Binary file content with appropriate Content-Type header.

---

### DELETE /uploads/:id
Delete an uploaded file (only by uploader).

---

## Organization Import (Admin Only)

### GET /admin/import/template
Download CSV template for organization import.

**Response:** CSV file download
```csv
LeaderEmail,ICFirstName,ICLastName,ICEmail,ICPosition,ICYearsOfService,ICTimeInPosition
leader@wawanesa.com,John,Doe,john.doe@wawanesa.com,Software Developer,2,1
leader@wawanesa.com,Jane,Smith,jane.smith@wawanesa.com,Senior Analyst,5,2.5
another.leader@wawanesa.com,Bob,Wilson,bob.wilson@wawanesa.com,QA Engineer,3,1
```

---

### POST /admin/import/preview
Preview CSV import without creating users.

**Request:** `multipart/form-data`
- `file`: CSV file

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "org-structure.csv",
    "totalRows": 3,
    "validRows": 2,
    "invalidRows": 1,
    "leaders": [
      {
        "email": "jordan.smith@wawanesa.com",
        "exists": false,
        "name": "Jordan Smith",
        "ics": [
          {
            "row": 1,
            "valid": true,
            "data": {
              "firstName": "Alex",
              "lastName": "Chen",
              "email": "alex.chen@wawanesa.com",
              "position": "Software Developer",
              "yearsOfService": 3,
              "timeInPosition": 1.5
            },
            "exists": false,
            "errors": []
          },
          {
            "row": 2,
            "valid": true,
            "data": {
              "firstName": "Sam",
              "lastName": "Johnson",
              "email": "sam.johnson@wawanesa.com",
              "position": "Senior Developer",
              "yearsOfService": 5,
              "timeInPosition": 2
            },
            "exists": false,
            "errors": []
          }
        ]
      },
      {
        "email": "taylor.wong@wawanesa.com",
        "exists": true,
        "name": "Taylor Wong",
        "ics": [
          {
            "row": 3,
            "valid": false,
            "data": {
              "firstName": "Pat",
              "lastName": "Williams",
              "email": "pat.williams@wawanesa.com",
              "position": "QA Engineer",
              "yearsOfService": null,
              "timeInPosition": 1
            },
            "exists": false,
            "errors": ["ICYearsOfService is required"]
          }
        ]
      }
    ],
    "summary": {
      "newLeaders": 1,
      "existingLeaders": 1,
      "newICs": 2,
      "existingICs": 0,
      "newRelationships": 2,
      "skippedRows": 1
    }
  }
}
```

**Errors:**
- `INVALID_FILE_TYPE`: Not a CSV file
- `INVALID_CSV_STRUCTURE`: Missing required columns

---

### POST /admin/import/execute
Execute the CSV import and create users/relationships.

**Request:** `multipart/form-data`
- `file`: CSV file (same as preview)
- `skipInvalid`: boolean (default: true) - skip invalid rows

**Response:**
```json
{
  "success": true,
  "data": {
    "leadersCreated": [
      {
        "id": "uuid",
        "name": "Jordan Smith",
        "email": "jordan.smith@wawanesa.com",
        "tempPassword": "TempPass789!"
      }
    ],
    "icsCreated": [
      {
        "id": "uuid",
        "name": "Alex Chen",
        "email": "alex.chen@wawanesa.com",
        "position": "Software Developer",
        "tempPassword": "TempPass123!"
      },
      {
        "id": "uuid",
        "name": "Sam Johnson",
        "email": "sam.johnson@wawanesa.com",
        "position": "Senior Developer",
        "tempPassword": "TempPass456!"
      }
    ],
    "relationshipsCreated": [
      {
        "leaderId": "uuid",
        "leaderName": "Jordan Smith",
        "icId": "uuid",
        "icName": "Alex Chen"
      },
      {
        "leaderId": "uuid",
        "leaderName": "Jordan Smith",
        "icId": "uuid",
        "icName": "Sam Johnson"
      }
    ],
    "skippedRows": [
      {
        "row": 3,
        "name": "Pat Williams",
        "reason": "ICYearsOfService is required"
      }
    ],
    "summary": {
      "leadersCreated": 1,
      "icsCreated": 2,
      "relationshipsCreated": 2,
      "rowsSkipped": 1
    }
  }
}
```

**Side Effects:**
- Creates User records for new Leaders (role = LEADER)
- Creates User records for new ICs (role = IC)
- Creates Relationship records
- Generates temporary passwords
- Sets `importedAt` and `importedById` on imported Users

**Errors:**
- `INVALID_FILE_TYPE`: Not a CSV file
- `INVALID_CSV_STRUCTURE`: Missing required columns
- `ALL_ROWS_INVALID`: No valid rows to import
- `FORBIDDEN`: Not an admin

---

### GET /admin/import/history
Get import history.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "org-structure.csv",
      "importedBy": {
        "id": "uuid",
        "name": "Admin User"
      },
      "leadersCreated": 1,
      "icsCreated": 2,
      "relationshipsCreated": 2,
      "rowsSkipped": 1,
      "importedAt": "2024-12-20T14:30:00Z",
      "credentialsExpireAt": "2024-12-27T14:30:00Z"
    }
  ]
}
```

---

### GET /admin/import/:id/credentials
Download credentials from a past import (expires after 7 days).

**Response:** CSV file download
```csv
Role,Name,Email,TempPassword
LEADER,Jordan Smith,jordan.smith@wawanesa.com,TempPass789!
IC,Alex Chen,alex.chen@wawanesa.com,TempPass123!
IC,Sam Johnson,sam.johnson@wawanesa.com,TempPass456!
```

**Errors:**
- `NOT_FOUND`: Import not found
- `CREDENTIALS_EXPIRED`: Credentials have expired (after 7 days)

---

## Webhooks (Future)

For future integrations:
- `meeting.created`
- `topic.added_to_meeting`
- `action.created`
- `action.completed`
