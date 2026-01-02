# 1:1 Companion

A Notion-inspired tool for meaningful 1:1 conversations between Leaders and Individual Contributors.

## Quick Context

- **Purpose**: Replace fragmented note-taking (OneNote, Confluence, Excel) with a unified 1:1 workspace
- **Target**: Internal pilot with 5-10 leaders for validation
- **Stack**: React + TypeScript, Node/Express, Prisma, SQLite (→ PostgreSQL/AWS later)
- **Design**: Notion-like UI — clean, minimal, elegant, block-based feel

## Documentation

Reference these files for detailed specs:

| Document | Purpose |
|----------|---------|
| `@docs/OVERVIEW.md` | Product vision, user types, core concepts |
| `@docs/DATA_MODEL.md` | Prisma schema, entity relationships |
| `@docs/FEATURES.md` | Feature specifications by area |
| `@docs/API_SPEC.md` | REST API endpoints |
| `@docs/UI_SCREENS.md` | Screen-by-screen specifications |
| `@docs/DECISIONS.md` | Technical choices and rationale |
| `@docs/GLOSSARY.md` | Terminology definitions |

## Design System

**CRITICAL**: Use the frontend-design skill for all UI work:
- Reference: `@.claude/skills/frontend-design.md`
- Aesthetic: Notion-inspired — clean, spacious, typography-focused
- Theme: Light mode primary, subtle shadows, warm neutrals
- Typography: Distinctive, readable, hierarchy-driven
- Interactions: Smooth, purposeful micro-animations
- Layout: Generous whitespace, card-based, drag-drop ready

**Avoid**: Generic UI, heavy borders, cluttered layouts, corporate/sterile feel

## Icon Library

**Location**: `@packages/web/src/components/icons/index.tsx`

The app uses animated icons from `animate-ui` for main sections and actions. Always use these designated icons for consistency:

**Section Icons:**
| Section           | Icon             | Import Alias       | Source Component                              |
|-------------------|------------------|--------------------|-----------------------------------------------|
| **Thoughts**      | Lightbulb        | `ThoughtsIcon`     | `@/components/animate-ui/icons/lightbulb`     |
| **Topics**        | ClipboardCheck   | `TopicsIcon`       | `@/components/animate-ui/icons/clipboard-check` |
| **Meetings**      | Users            | `MeetingsIcon`     | `@/components/animate-ui/icons/users`         |
| **Position Types**| UserRound        | `PositionTypeIcon` | `@/components/animate-ui/icons/user-round`    |

> **Note**: The `PositionTypeIcon` (UserRound) is used for ALL position type column headers in the Team Board (e.g., "Solutions Analysts", "Developers", "System Administrators"). Do NOT use different icons for different position types - use `PositionTypeIcon` consistently.

**Action Icons:**
| Action        | Icon             | Import Alias     | Source Component                              |
|---------------|------------------|------------------|-----------------------------------------------|
| **Delete**    | Trash2           | `DeleteIcon`     | `@/components/animate-ui/icons/trash-2`       |
| **Promote**   | Sparkles         | `PromoteIcon`    | `@/components/animate-ui/icons/sparkles`      |
| **Back**      | MoveLeft         | `BackIcon`       | `@/components/animate-ui/icons/move-left`     |

### Usage

```tsx
import { ThoughtsIcon, TopicsIcon, MeetingsIcon, PositionTypeIcon, ICON_SIZES } from '@/components/icons';

// Section headers (workspace panels)
<ThoughtsIcon size={ICON_SIZES.sectionHeader} animateOnHover />  // size={25}
<TopicsIcon size={ICON_SIZES.sectionHeader} animateOnHover />
<MeetingsIcon size={ICON_SIZES.sectionHeader} animateOnHover />

// Position type columns (Team Board - use same icon for ALL position types)
<PositionTypeIcon size={ICON_SIZES.sectionHeader} animateOnHover />

// Modal titles / transitions
<ThoughtsIcon size={ICON_SIZES.modal} animateOnHover />  // size={22}
```

### Standard Sizes

| Context          | Size | Constant                    |
|------------------|------|-----------------------------|
| Section headers  | 25   | `ICON_SIZES.sectionHeader`  |
| Modal titles     | 22   | `ICON_SIZES.modal`          |
| Inline text      | 18   | `ICON_SIZES.inline`         |
| Small indicators | 16   | `ICON_SIZES.small`          |

### Adding New Icons

To add new animate-ui icons:
```bash
cd packages/web
npx shadcn@latest add @animate-ui/icons-[icon-name] --overwrite
```

## Key Patterns

### Backend
- All API routes under `/api/v1/`
- Prisma for all database operations
- Auth middleware on protected routes
- Service layer pattern (for easy Cognito swap later)
- RESTful conventions

### Frontend
- React Query for server state
- Tailwind CSS for styling (follow frontend-design skill)
- Component-driven architecture
- Optimistic updates for drag-drop
- Mobile-responsive

### Auth
- JWT for MVP (abstract behind AuthService)
- Prepare for Cognito migration

## Project Structure

```
one-on-one-companion/
├── CLAUDE.md                 # This file
├── docs/                     # Documentation
├── packages/
│   ├── web/                  # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── icons/    # Icon library (ThoughtsIcon, TopicsIcon, etc.)
│   │   │   │   ├── animate-ui/ # Animated icons from animate-ui
│   │   │   │   ├── ui/       # Base UI components (Button, Modal, etc.)
│   │   │   │   ├── thoughts/ # Thought-related components
│   │   │   │   └── topics/   # Topic-related components
│   │   │   ├── pages/        # Route-level components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── services/     # API client
│   │   │   └── types/        # TypeScript types
│   │   └── package.json
│   │
│   ├── api/                  # Express backend
│   │   ├── src/
│   │   │   ├── routes/       # API route handlers
│   │   │   ├── services/     # Business logic
│   │   │   ├── middleware/   # Auth, validation, etc.
│   │   │   └── types/        # TypeScript types
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   └── shared/               # Shared types & constants
│       └── src/
│           └── types/
│
├── .claude/
│   └── skills/
│       └── frontend-design.md
│
└── package.json              # Monorepo root
```

## Current Phase

**Phase 1: Foundation**
- [ ] Project scaffolding
- [ ] Prisma schema
- [ ] Basic auth (JWT)
- [ ] User management

## Commands

```bash
# Install dependencies
npm install

# Run development
npm run dev

# Run API only
npm run dev:api

# Run web only
npm run dev:web

# Database migrations
npm run db:migrate

# Database studio
npm run db:studio

# Engineering Principles for Internal Applications

> Baseline standards for internal apps built with Claude Code. These apps may handle sensitive data (HR, performance, personal notes) where a leak would cause real harm. Project-specific requirements (auth provider, database, stack) are defined elsewhere.

---

## 1. Protect Sensitive Data

- **Encrypt at rest**: Sensitive fields (notes, reviews, personal data) are encrypted in the database. Use AES-256 or database-native encryption.
- **TLS everywhere**: All traffic uses HTTPS. No exceptions for "it's internal."
- **Hash passwords properly**: Use bcrypt or Argon2. Never MD5, SHA-1, or plain SHA-256.
- **No secrets in code**: Credentials, API keys, and connection strings come from environment variables or a secrets manager. Never committed to repo.
- **No sensitive data in logs**: Never log personal notes, review content, passwords, or tokens. Log user IDs, not usernames or emails when possible.

---

## 2. Prevent Common Attacks

- **Parameterized queries only**: All database queries use parameterized statements or ORM-safe methods. Never concatenate user input into SQL.
- **Validate all input server-side**: Check type, length, and format. Don't trust client validation.
- **Encode output**: Escape HTML, JSON, and other output to prevent XSS.
- **CORS configured explicitly**: Specify allowed origins. No wildcards in production.

---

## 3. Authentication & Access Control

- **Authenticate before anything sensitive**: No sensitive endpoints without authentication.
- **Check authorization on every request**: Verify the user has permission to access/modify the specific resource. Users should only see their own data or data they manage.
- **Secure session handling**: HttpOnly, Secure, SameSite cookies. Sessions expire.
- **Fail closed**: If auth check fails or is uncertain, deny access.

---

## 4. Code That Doesn't Embarrass You

- **Handle errors explicitly**: No silent catches. Log errors with context. Show users a safe message, not stack traces.
- **Clean up resources**: Close database connections, file handles, streams. Use `using`, `with`, `finally`, or equivalent.
- **Separate concerns**: Keep business logic out of route handlers. Keep SQL out of controllers.
- **Type safety**: Use types/interfaces where the language supports it.
- **No dead code**: Remove unused imports, commented-out code, and obsolete functions.

---

## 5. Basic Reliability

- **Timeouts on external calls**: HTTP requests and database queries have explicit timeouts.
- **Connection pooling**: Don't create a new database connection per request.
- **Validate config at startup**: Fail fast if required configuration is missing.
- **Health endpoint**: Expose a simple `/health` for monitoring.

---

## 6. Minimum Viable Testing

- **Test auth and authorization**: Verify users can't access other users' data.
- **Test input validation**: Confirm bad input is rejected.
- **Test the happy path**: Core workflows have at least basic coverage.

---

## 7. Documentation

- **README**: How to run locally, environment variables needed, how to deploy.
- **API docs**: For any endpoints others will consume, document inputs/outputs.

---

## The 3 Questions

Before completing any feature, ask:

1. **Could a user access someone else's sensitive data?** → Fix authorization.
2. **Could an attacker inject code or queries?** → Validate input, parameterize queries, encode output.
3. **Would this pass a senior engineer's code review?** → If not, fix it before moving on.

---

*These are the non-negotiables. Skip the enterprise patterns, but never skip data protection.*

```
