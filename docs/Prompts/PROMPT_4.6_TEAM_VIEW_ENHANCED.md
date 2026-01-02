# Prompt 4.6 - UPDATED: Team API & Leader Team View with Position Columns

## Overview

The Leader's Team View is a visual board showing ICs organized by **Position Type** (columns). Leaders can drag ICs between columns and reorder them within columns. The sidebar has a "My Team" menu with sub-items for each IC.

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  👥 My Team                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Solutions Analysts    │    Developers          │    System Admins       │
│  ──────────────────    │    ───────────────     │    ────────────────    │
│        │               │          │             │          │             │
│        ○ Alex Chen     │          ○ Dev 1       │          ○ Admin 1     │
│        │               │          │             │          │             │
│        ○ Jamie Wong    │          ○ Senior Dev  │          ○ Admin 2     │
│        │               │          │             │                        │
│        ○ Sam Park      │          ○ Lead Dev    │                        │
│                        │                        │                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Sidebar Sub-menu

```
┌──────────────────┐
│ 🏠 Dashboard     │
│                  │
│ 👥 My Team       │
│   ├─ Alex Chen   │
│   ├─ Jamie Wong  │
│   ├─ Sam Park    │
│   └─ Dev 1       │
│                  │
│ ⚙️ Settings      │
└──────────────────┘
```

---

## Prompt 4.6 - Team API & Enhanced Team View

```
Continue building the 1:1 Companion app.

Implement the Leader's Team View with ICs organized in columns by Position Type:

**Database Schema Update:**

1. Update prisma/schema.prisma - Add positionType and displayOrder to User:

   model User {
     // ... existing fields ...
     
     position        String?    // e.g., "Solutions Analyst", "Senior Developer"
     positionType    String?    // e.g., "SOLUTIONS_ANALYST", "DEVELOPER", "SYSTEM_ADMIN"
     
     // For ordering within team view
     teamDisplayOrder Int?      // Order within the position type column
   }

   Also create a PositionType model for managing column types:

   model PositionType {
     id           String   @id @default(uuid())
     name         String   // Display name: "Solutions Analysts"
     code         String   @unique // "SOLUTIONS_ANALYST"
     displayOrder Int      @default(0) // Order of columns left to right
     leaderId     String   // Each leader can have their own column setup
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt

     leader User @relation("LeaderPositionTypes", fields: [leaderId], references: [id])

     @@unique([leaderId, code])
     @@index([leaderId])
   }

   Add to User model:
     positionTypes PositionType[] @relation("LeaderPositionTypes")

2. Run migration:
   npx prisma migrate dev --name add_position_types

3. Update seed file to include:
   - Sample position types for the seeded Leader
   - positionType values for seeded ICs

**Backend API:**

4. Implement src/routes/team.ts:
   
   - GET /api/v1/team
     * Return Leader's ICs grouped by positionType:
       ```json
       {
         "positionTypes": [
           {
             "id": "...",
             "name": "Solutions Analysts",
             "code": "SOLUTIONS_ANALYST",
             "displayOrder": 0,
             "members": [
               { "id": "...", "name": "Alex Chen", "position": "Senior Analyst", "teamDisplayOrder": 0, ... },
               { "id": "...", "name": "Jamie Wong", "position": "Analyst", "teamDisplayOrder": 1, ... }
             ]
           },
           {
             "id": "...",
             "name": "Developers", 
             "code": "DEVELOPER",
             "displayOrder": 1,
             "members": [...]
           }
         ],
         "unassigned": [...] // ICs without positionType
       }
       ```
     * Members sorted by teamDisplayOrder within each column
     * Position types sorted by displayOrder

   - GET /api/v1/team/:icId
     * Return specific IC details
     * Verify relationship exists

   - PUT /api/v1/team/reorder
     * Update IC positions after drag-drop
     * Body: 
       ```json
       {
         "icId": "...",
         "positionType": "DEVELOPER",  // New column (null = unassigned)
         "displayOrder": 2              // New position in column
       }
       ```
     * Reorder other ICs in affected columns automatically

   - PUT /api/v1/team/columns/reorder
     * Reorder position type columns
     * Body: { "columnOrder": ["DEVELOPER", "SOLUTIONS_ANALYST", "SYSTEM_ADMIN"] }

   - POST /api/v1/team/columns
     * Create new position type column
     * Body: { "name": "QA Engineers", "code": "QA_ENGINEER" }

   - DELETE /api/v1/team/columns/:code
     * Delete a column (moves ICs to unassigned)

5. Implement src/services/teamService.ts:
   - getTeamGroupedByPosition(leaderId)
   - reorderIC(leaderId, icId, positionType, displayOrder)
   - reorderColumns(leaderId, columnOrder)
   - createColumn(leaderId, name, code)
   - deleteColumn(leaderId, code)

**Frontend:**

6. Create src/layouts/LeaderLayout.tsx:
   - Sidebar with:
     * Dashboard link (future)
     * "My Team" expandable menu
       - Sub-items for each IC (fetched from API)
       - Click IC → navigate to /team/:icId
     * Settings link (future)
   - Main content area
   - Header with user info

7. Create src/components/leader/TeamSidebar.tsx:
   - "My Team" section with expand/collapse
   - List each IC with small avatar/icon + name
   - Click → /team/:icId
   - Active state when on that IC's page
   - Sorted alphabetically or by column order

8. Create src/pages/leader/TeamPage.tsx:
   - Route: /team
   - Header: "👥 My Team"
   - Horizontal columns for each position type
   - Uses @dnd-kit for drag-drop
   - Responsive: columns stack on mobile

9. Create src/components/team/PositionColumn.tsx:
   - Column header: Icon + Position Type name
   - Thin horizontal divider line below header
   - Vertical connector line down the column
   - List of ICMiniCard components connected to the line
   - Drop zone for dragging ICs into this column
   - Draggable column (can reorder columns)
   - Empty state: dashed border, "Drag team members here"

10. Create src/components/team/ICMiniCard.tsx:
    - Minimalist design matching IC workspace style:
      ```
      ○───┬─────────────────┐
          │ 👤 Alex Chen    │
          │ Senior Analyst  │
          └─────────────────┘
      ```
    - Person icon (○) connected to vertical line
    - Name (bold) + Position (smaller, muted)
    - Subtle hover effect
    - Draggable (can move between columns)
    - Click → /team/:icId
    - Small stats on hover or always visible:
      * "2 upcoming meetings"
      * "3 open actions"

11. Create src/components/team/ColumnConnector.tsx:
    - Thin vertical line connecting all cards in a column
    - Person icon (○) for each IC positioned on the line
    - Animated when dragging

12. Implement drag-drop with @dnd-kit:
    - Install: npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
    - DndContext wrapping the team board
    - Draggable ICMiniCards
    - Droppable PositionColumns
    - Sortable within columns (reorder ICs)
    - On drag end:
      * If moved to different column: call PUT /team/reorder
      * If reordered within column: call PUT /team/reorder
    - Visual feedback during drag

13. Create src/components/team/AddColumnButton.tsx:
    - "+" button at the end of columns
    - Opens modal to create new position type
    - Form: Name, Code (auto-generated from name)

14. Create src/hooks/useTeam.ts:
    - useTeamBoard() - returns grouped ICs and columns
    - useReorderIC()
    - useReorderColumns()
    - useCreateColumn()
    - useDeleteColumn()

15. Update App.tsx routes:
    - /team → TeamPage
    - /team/:icId → ICWorkspacePage (next prompt)

16. Style guidelines (matching IC workspace):
    - Clean white background
    - Thin grey divider lines (1px, #E5E7EB)
    - Minimal shadows
    - Wawanesa Blue for active/hover states
    - Position type headers: medium weight, slightly muted color
    - Cards: white with subtle border, hover lift effect
    - Connector line: thin grey (#D1D5DB)
    - Person icons: small circles on the connector line

**Seed Data Updates:**

17. Update prisma/seed.ts:
    - Create position types for the demo Leader:
      * Solutions Analysts (displayOrder: 0)
      * Developers (displayOrder: 1)  
      * System Administrators (displayOrder: 2)
    - Assign positionType to seeded ICs
    - Set teamDisplayOrder for each IC

Test:
- View team board with columns
- Drag IC to different column
- Reorder ICs within a column
- Add a new column
- Click IC → navigates to their workspace
- Sidebar shows all ICs under "My Team"
```

---

## Visual Reference

### Team Board Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 👥 My Team                                                    [+ Add Column] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐            │
│ │ 💼 Solutions     │   │ 💻 Developers    │   │ 🖥️ System       │            │
│ │ Analysts        │   │                 │   │ Administrators  │            │
│ ├─────────────────┤   ├─────────────────┤   ├─────────────────┤            │
│ │       │         │   │       │         │   │       │         │            │
│ │       ○─┬──────┐│   │       ○─┬──────┐│   │       ○─┬──────┐│            │
│ │       │ │Alex  ││   │       │ │Dev 1 ││   │       │ │Admin ││            │
│ │       │ │Chen  ││   │       │ │Junior││   │       │ │One   ││            │
│ │       │ └──────┘│   │       │ └──────┘│   │       │ └──────┘│            │
│ │       │         │   │       │         │   │       │         │            │
│ │       ○─┬──────┐│   │       ○─┬──────┐│   │       ○─┬──────┐│            │
│ │       │ │Jamie ││   │       │ │Senior││   │       │ │Admin ││            │
│ │       │ │Wong  ││   │       │ │Dev   ││   │       │ │Two   ││            │
│ │       │ └──────┘│   │       │ └──────┘│   │       │ └──────┘│            │
│ │       │         │   │       │         │   │                 │            │
│ │       ○─┬──────┐│   │       ○─┬──────┐│   │                 │            │
│ │         │Sam   ││   │       │ │Lead  ││   │                 │            │
│ │         │Park  ││   │       │ │Dev   ││   │                 │            │
│ │         └──────┘│   │       │ └──────┘│   │                 │            │
│ │                 │   │                 │   │                 │            │
│ └─────────────────┘   └─────────────────┘   └─────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### IC Mini Card Detail

```
       │
       ○────┬─────────────────────┐
       │    │ 👤 Alex Chen        │  ← Name (bold)
       │    │ Senior Analyst      │  ← Position (muted)
       │    │ ○ 2 meetings        │  ← Stats (small, optional)
       │    └─────────────────────┘
       │
```

### Sidebar with IC Sub-menu

```
┌────────────────────────┐
│                        │
│  📊 Dashboard          │
│                        │
│  👥 My Team      ▼     │  ← Expandable
│     ├── Alex Chen      │
│     ├── Jamie Wong     │
│     ├── Sam Park       │
│     ├── Dev 1          │
│     └── Admin One      │
│                        │
│  ⚙️ Settings           │
│                        │
└────────────────────────┘
```

---

## Key Implementation Notes

1. **Position Types are per-Leader**: Each Leader manages their own column setup
2. **ICs can be unassigned**: If no positionType, show in "Unassigned" section
3. **Drag-drop persists immediately**: Each move calls the API
4. **Sidebar IC list**: Flat list of all ICs, alphabetical
5. **Column order is draggable**: Leaders can rearrange columns too
6. **Mobile responsive**: Columns stack vertically on small screens
