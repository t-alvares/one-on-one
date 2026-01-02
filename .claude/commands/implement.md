# Implement Prompt

Execute a prompt file to implement a feature from `docs/Prompts/`.

## Arguments

$ARGUMENTS - The prompt file name or partial match (e.g., "Prompt 4.9" or "Meetings Frontend")

## Workflow

Follow these 5 phases with **ultrathink** reasoning for each:

### Phase 1: Understanding & Planning

1. **Find and read the prompt file** from `docs/Prompts/` directory matching "$ARGUMENTS"
2. **Analyze the scope**:
   - What models/schemas need to change?
   - What API endpoints are required?
   - What frontend components are needed?
   - What are the dependencies between tasks?
3. **Check existing implementation**:
   - Read relevant existing files to understand current state
   - Identify what's already implemented vs what's new
4. **Create a todo list** using TodoWrite with all implementation tasks

### Phase 2: Implementation

Execute each task from the todo list:

1. **Schema changes** (if any):
   - Update `packages/api/prisma/schema.prisma`
   - Run migration if needed: `npx prisma migrate dev --name <migration_name>`

2. **Backend implementation**:
   - Create/update validation schemas in `packages/api/src/schemas/`
   - Create/update services in `packages/api/src/services/`
   - Create/update routes in `packages/api/src/routes/`
   - Register routes in `packages/api/src/index.ts`

3. **Frontend implementation** (if applicable):
   - Create/update hooks in `packages/web/src/hooks/`
   - Create/update components in `packages/web/src/components/`
   - Create/update pages in `packages/web/src/pages/`
   - Update routing in `packages/web/src/App.tsx`

4. **Mark tasks complete** as you finish each one

### Phase 3: Testing & Verification

1. **TypeScript compilation check**:
   ```bash
   cd packages/api && npx tsc --noEmit
   cd packages/web && npx tsc --noEmit
   ```

2. **Build verification**:
   ```bash
   npm run build:api
   npm run build:web
   ```

3. **Fix any errors** before proceeding

### Phase 4: Documentation

Create implementation documentation at `docs/implementation/Prompt_X.X_Implementation.md`:

```markdown
# Prompt X.X - [Title] Implementation

**Completed:** YYYY-MM-DD

## Summary
Brief description of what was implemented.

## Changes Made

### Schema Changes (if any)
- List model changes
- Migration name

### Backend Changes
| File | Description |
|------|-------------|
| `path/to/file.ts` | What was changed |

### Frontend Changes (if any)
| File | Description |
|------|-------------|
| `path/to/file.tsx` | What was changed |

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/...` | Description |

## Key Features
- Feature 1
- Feature 2

## Testing Notes
How to test the implementation manually.
```

### Phase 5: Update PROGRESS.md

1. **Read current PROGRESS.md**
2. **Add new section** for the completed prompt following the existing format
3. **Update the summary table** at the top
4. **Update "Next Steps"** section if applicable
5. **Update the "Last updated" date**

## Important Guidelines

- **Ultrathink** for each phase to ensure thorough analysis
- **Check existing code first** - much may already be implemented
- **Follow existing patterns** in the codebase
- **Use TodoWrite** to track progress throughout
- **Don't create unnecessary files** - prefer editing existing ones
- **Test builds** before documenting as complete
- **Reference CLAUDE.md** for project conventions

## Error Handling

If implementation fails:
1. Document what was attempted
2. Document the error encountered
3. Suggest next steps for resolution
4. Do NOT mark as complete in PROGRESS.md
