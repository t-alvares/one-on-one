# Technical Decisions

This document captures key technical decisions, their rationale, and migration paths.

---

## Stack Overview

| Layer | MVP Choice | Production Path |
|-------|-----------|-----------------|
| Frontend | React + TypeScript | Same |
| Styling | Tailwind CSS | Same |
| Backend | Node.js + Express | Same (containerized) |
| ORM | Prisma | Same |
| Database | SQLite | PostgreSQL (RDS) |
| Auth | JWT | AWS Cognito |
| Hosting | Local / Railway | AWS Fargate |
| Email | Console log / SMTP | AWS SES |

---

## Decision 1: Monorepo Structure

**Decision**: Use a monorepo with packages for web, api, and shared code.

**Rationale**:
- Shared TypeScript types between frontend and backend
- Single repository to manage
- Easier local development
- Coordinated deployments

**Structure**:
```
one-on-one-companion/
├── packages/
│   ├── web/          # React frontend
│   ├── api/          # Express backend
│   └── shared/       # Shared types
└── package.json      # Root with workspaces
```

**Tools**:
- npm workspaces (built-in, no extra dependencies)
- TypeScript project references

---

## Decision 2: SQLite for MVP

**Decision**: Use SQLite as the MVP database, with Prisma ORM.

**Rationale**:
- Zero infrastructure—just a file
- Fast local development
- Good enough for 5-10 pilot users
- Prisma makes migration trivial

**Migration Path**:
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

**When to Migrate**:
- When scaling beyond pilot
- When concurrent writes become an issue
- When moving to AWS

---

## Decision 3: JWT Authentication

**Decision**: Use JWT tokens with email/password for MVP.

**Rationale**:
- Simple to implement
- No external dependencies
- Works offline
- Abstract behind AuthService for easy swap

**Implementation**:
```typescript
// Abstract interface
interface AuthService {
  login(email: string, password: string): Promise<AuthResult>;
  validateToken(token: string): Promise<User | null>;
  getCurrentUser(req: Request): Promise<User>;
}

// MVP implementation
class JWTAuthService implements AuthService {
  // JWT logic
}

// Future implementation
class CognitoAuthService implements AuthService {
  // Cognito logic
}
```

**Token Storage**:
- Store in localStorage (simple)
- Or httpOnly cookie (more secure)

**Migration Path**:
1. Implement CognitoAuthService
2. Update environment config
3. Switch implementation in DI container
4. No other code changes needed

---

## Decision 4: React Query for Data Fetching

**Decision**: Use React Query (TanStack Query) for server state management.

**Rationale**:
- Automatic caching and refetching
- Optimistic updates for drag-drop
- Loading and error states built-in
- Reduces boilerplate significantly

**Example**:
```typescript
// Fetching thoughts
const { data: thoughts, isLoading } = useQuery({
  queryKey: ['thoughts'],
  queryFn: () => api.getThoughts(),
});

// Creating a thought with optimistic update
const createThought = useMutation({
  mutationFn: (content: string) => api.createThought({ content }),
  onMutate: async (content) => {
    // Optimistic update
    await queryClient.cancelQueries(['thoughts']);
    const previous = queryClient.getQueryData(['thoughts']);
    queryClient.setQueryData(['thoughts'], (old) => [
      { id: 'temp', content, createdAt: new Date() },
      ...old,
    ]);
    return { previous };
  },
  onError: (err, content, context) => {
    // Rollback on error
    queryClient.setQueryData(['thoughts'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['thoughts']);
  },
});
```

---

## Decision 5: Tailwind CSS

**Decision**: Use Tailwind CSS for styling.

**Rationale**:
- Rapid development
- Consistent design tokens
- No CSS file management
- Great with component-based architecture
- Follows frontend-design skill guidelines

**Custom Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom palette from design system
        primary: '#2563EB',
        surface: '#FAFAFA',
        // ...
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
};
```

---

## Decision 6: Prisma ORM

**Decision**: Use Prisma for database access.

**Rationale**:
- Type-safe database queries
- Auto-generated types from schema
- Easy migrations
- Works with SQLite and PostgreSQL
- Great developer experience

**Key Features Used**:
- Schema-first design
- Migrations
- Prisma Client for queries
- Prisma Studio for debugging

**Example**:
```typescript
// Type-safe query
const thoughts = await prisma.thought.findMany({
  where: { userId: user.id },
  include: { label: true },
  orderBy: { createdAt: 'desc' },
});
```

---

## Decision 7: Express.js Backend

**Decision**: Use Express.js for the API server.

**Rationale**:
- Simple and well-understood
- Easy to containerize
- Large ecosystem
- Claude Code handles it well
- Same language as frontend (TypeScript)

**Alternatives Considered**:
- Fastify: Faster, but less ecosystem
- NestJS: More structure, but heavier

**Structure**:
```
api/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── thoughts.ts
│   │   ├── topics.ts
│   │   └── ...
│   ├── services/
│   │   ├── authService.ts
│   │   ├── thoughtService.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── validation.ts
│   └── index.ts
└── prisma/
    └── schema.prisma
```

---

## Decision 8: Drag-and-Drop Library

**Decision**: Use @dnd-kit/core for drag-and-drop functionality.

**Rationale**:
- Modern, accessible
- React-first design
- Good performance
- Flexible and composable
- Active maintenance

**Usage**:
- Dragging topics to meetings
- Reordering competencies (admin)
- Reordering agenda items

**Example**:
```tsx
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function TopicCard({ topic }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: topic.id,
  });
  
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {topic.title}
    </div>
  );
}

function MeetingDropZone({ meeting }) {
  const { setNodeRef, isOver } = useDroppable({
    id: meeting.id,
  });
  
  return (
    <div ref={setNodeRef} className={isOver ? 'bg-blue-50' : ''}>
      {meeting.topics.map(t => <TopicCard topic={t} />)}
    </div>
  );
}
```

---

## Decision 9: Block Editor (Tiptap)

**Decision**: Use Tiptap for Notion-like block-based content editing.

**Rationale**:
- Built on ProseMirror (battle-tested)
- React-friendly with @tiptap/react
- Slash commands support built-in
- Highly extensible
- Great DX with TypeScript
- Active community and maintenance
- Supports collaborative editing (future)

**Where Used**:
- Thought pages (full content)
- Topic pages (full content)
- Meeting notes
- Action descriptions

**Extensions Used**:
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({
      placeholder: 'Type / for commands...',
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Link.configure({ openOnClick: false }),
    Image,
    CodeBlockLowlight,
    Highlight,
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    debouncedSave(editor.getJSON());
  },
});
```

**Slash Command Menu**:
| Command | Block Type |
|---------|------------|
| `/text` | Paragraph |
| `/h1` | Heading 1 |
| `/h2` | Heading 2 |
| `/h3` | Heading 3 |
| `/bullet` | Bulleted list |
| `/number` | Numbered list |
| `/todo` | Checklist |
| `/quote` | Blockquote |
| `/divider` | Horizontal line |
| `/code` | Code block |
| `/callout` | Callout box |
| `/image` | Image |
| `/file` | File attachment |

**Content Storage**:
- Stored as JSON (Tiptap's native format)
- Prisma field type: `Json`
- Auto-save with 500ms debounce

---

## Decision 10: Notification Strategy

**Decision**: Start with in-app notifications only; add email later.

**MVP**:
- Store notifications in database
- Poll for new notifications (every 30s)
- Show badge on bell icon

**Future**:
- WebSocket for real-time updates
- AWS SES for email
- User preferences for notification types

**Notification Types**:
| Type | In-App | Email |
|------|--------|-------|
| Topic added to meeting | ✅ MVP | V2 |
| Action assigned | ✅ MVP | V2 |
| Progress update | ✅ MVP | ❌ |
| Meeting reminder | V2 | V2 |

---

## Decision 11: Deployment Strategy

**MVP Deployment**:
- Option A: Local network (same office)
- Option B: Railway.app (quick, free tier)
- Option C: Single EC2 instance

**Production Deployment (AWS)**:
```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │     ALB     │───▶│   Fargate   │───▶│     RDS     │        │
│   │ (HTTPS/443) │    │  (Docker)   │    │ (PostgreSQL)│        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│          │                  │                                   │
│          │           ┌──────┴──────┐                           │
│          │           │             │                           │
│   ┌──────▼──────┐   ┌▼─────────┐  ┌▼─────────┐                │
│   │   Cognito   │   │    ECR   │  │    SES   │                │
│   │   (Auth)    │   │ (Images) │  │ (Email)  │                │
│   └─────────────┘   └──────────┘  └──────────┘                │
│                                                                 │
│   ┌─────────────┐   ┌──────────┐                               │
│   │ CloudWatch  │   │    S3    │                               │
│   │  (Logs)     │   │ (Static) │                               │
│   └─────────────┘   └──────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Container Strategy**:
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

---

## Decision 11: Error Handling

**Strategy**: Consistent error format across API.

**Error Response Shape**:
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;      // Machine-readable
    message: string;   // Human-readable
    details?: any;     // Optional extra info
  };
}
```

**Error Codes**:
- `UNAUTHORIZED`: Not logged in
- `FORBIDDEN`: No permission
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input
- `INTERNAL_ERROR`: Server error

**Frontend Handling**:
```typescript
// API client with error handling
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new ApiError(data.error.code, data.error.message);
  }
  
  return data.data;
}
```

---

## Decision 12: Testing Strategy

**MVP**: Minimal testing, focus on critical paths.

**Priority**:
1. API route tests (integration)
2. Auth flow tests
3. Core component tests (React)

**Tools**:
- Vitest (fast, Vite-compatible)
- React Testing Library
- Supertest (API testing)

**Future**:
- E2E tests with Playwright
- Visual regression tests
- Load testing before production

---

## Security Considerations

### MVP Security
- [x] Password hashing (bcrypt)
- [x] JWT token expiration (24h)
- [x] Input validation (Zod)
- [x] CORS configuration
- [x] SQL injection prevention (Prisma)

### Production Security (Future)
- [ ] HTTPS everywhere
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Security headers (Helmet.js)
- [ ] Audit logging
- [ ] Data encryption at rest
- [ ] AWS security best practices

---

## Performance Considerations

### MVP Performance
- Simple queries, no optimization needed
- React Query caching helps

### Production Performance (Future)
- Database indexing (defined in schema)
- Query optimization
- Redis caching layer
- CDN for static assets
- Lazy loading routes
