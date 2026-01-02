# BlockNote Editor Implementation Guide

## Overview

This document provides instructions for implementing BlockNote as the block-based editor for Thoughts, Topics, and Meetings in the 1:1 Companion application. BlockNote is a Notion-style rich text editor built on ProseMirror and TipTap.

**Documentation:** https://www.blocknotejs.org/docs

---

## 1. Installation

### Install Required Packages

```bash
pnpm add @blocknote/core @blocknote/react @blocknote/shadcn
```

> We use the shadcn variant since our project already uses shadcn/ui components.

---

## 2. Project Structure

Create the following file structure:

```
src/
├── components/
│   ├── editor/
│   │   ├── Editor.tsx              # Base editor client component
│   │   ├── DynamicEditor.tsx       # Dynamic import wrapper (SSR fix)
│   │   ├── ThoughtsEditor.tsx      # Thoughts-specific editor
│   │   ├── TopicsEditor.tsx        # Topics-specific editor
│   │   └── MeetingsEditor.tsx      # Meetings-specific editor
│   └── ui/
│       └── ... (existing shadcn components)
```

---

## 3. Tailwind CSS Configuration

### Update your main CSS file (e.g., `globals.css`)

Add the BlockNote source directive and ShadCN CSS variables:

```css
@import "tailwindcss";

/* Path to your installed @blocknote/shadcn package */
@source "../node_modules/@blocknote/shadcn";

@custom-variant dark (&:is(.dark *));

/* Light theme ShadCN CSS variables (if not already present) */
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

/* Dark theme ShadCN CSS variables */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

/* Extending Tailwind theme with ShadCN utility classes */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* Applies border styles within the editor */
@layer base {
  .bn-shadcn * {
    @apply border-border outline-ring/50;
  }
}
```

---

## 4. Next.js Configuration

### Disable React Strict Mode (Required for BlockNote + React 19 / Next 15)

Update `next.config.ts`:

```typescript
const nextConfig = {
  reactStrictMode: false,
  // ... other config
};

export default nextConfig;
```

---

## 5. Base Editor Component

### `src/components/editor/Editor.tsx`

```tsx
"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { Block, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCallback, useEffect } from "react";

interface EditorProps {
  initialContent?: PartialBlock[];
  onChange?: (blocks: Block[]) => void;
  editable?: boolean;
  placeholder?: string;
}

export default function Editor({
  initialContent,
  onChange,
  editable = true,
  placeholder = "Type '/' for commands...",
}: EditorProps) {
  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent || [
      {
        type: "paragraph",
        content: "",
      },
    ],
  });

  // Handle content changes
  const handleChange = useCallback(() => {
    if (onChange) {
      onChange(editor.document);
    }
  }, [editor, onChange]);

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      onChange={handleChange}
      theme="light"
      shadCNComponents={{
        // Pass your custom shadcn components here if needed
        // Button,
        // Select,
        // etc.
      }}
    />
  );
}
```

### `src/components/editor/DynamicEditor.tsx`

```tsx
"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Dynamic import to disable SSR for BlockNote
const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => (
    <div className="h-32 animate-pulse rounded-md bg-muted" />
  ),
});

type EditorProps = ComponentProps<typeof Editor>;

export function DynamicEditor(props: EditorProps) {
  return <Editor {...props} />;
}

export default DynamicEditor;
```

---

## 6. Specialized Editors

### `src/components/editor/ThoughtsEditor.tsx`

For private thoughts in the IC workspace:

```tsx
"use client";

import { Block, PartialBlock } from "@blocknote/core";
import { DynamicEditor } from "./DynamicEditor";

interface ThoughtsEditorProps {
  thoughtId: string;
  initialContent?: PartialBlock[];
  onSave: (thoughtId: string, blocks: Block[]) => Promise<void>;
}

export function ThoughtsEditor({
  thoughtId,
  initialContent,
  onSave,
}: ThoughtsEditorProps) {
  // Debounced save handler
  const handleChange = async (blocks: Block[]) => {
    // Implement debounce logic here
    await onSave(thoughtId, blocks);
  };

  return (
    <div className="thoughts-editor">
      <DynamicEditor
        initialContent={initialContent}
        onChange={handleChange}
        placeholder="Capture your thoughts... Type '/' for formatting options"
      />
    </div>
  );
}
```

### `src/components/editor/TopicsEditor.tsx`

For topics that can be scheduled for meetings:

```tsx
"use client";

import { Block, PartialBlock } from "@blocknote/core";
import { DynamicEditor } from "./DynamicEditor";

interface TopicsEditorProps {
  topicId: string;
  initialContent?: PartialBlock[];
  onSave: (topicId: string, blocks: Block[]) => Promise<void>;
  readOnly?: boolean;
}

export function TopicsEditor({
  topicId,
  initialContent,
  onSave,
  readOnly = false,
}: TopicsEditorProps) {
  const handleChange = async (blocks: Block[]) => {
    await onSave(topicId, blocks);
  };

  return (
    <div className="topics-editor">
      <DynamicEditor
        initialContent={initialContent}
        onChange={handleChange}
        editable={!readOnly}
        placeholder="Describe your topic... Type '/' for formatting options"
      />
    </div>
  );
}
```

### `src/components/editor/MeetingsEditor.tsx`

For meeting notes:

```tsx
"use client";

import { Block, PartialBlock } from "@blocknote/core";
import { DynamicEditor } from "./DynamicEditor";

interface MeetingsEditorProps {
  meetingId: string;
  initialContent?: PartialBlock[];
  onSave: (meetingId: string, blocks: Block[]) => Promise<void>;
  readOnly?: boolean;
}

export function MeetingsEditor({
  meetingId,
  initialContent,
  onSave,
  readOnly = false,
}: MeetingsEditorProps) {
  const handleChange = async (blocks: Block[]) => {
    await onSave(meetingId, blocks);
  };

  return (
    <div className="meetings-editor">
      <DynamicEditor
        initialContent={initialContent}
        onChange={handleChange}
        editable={!readOnly}
        placeholder="Meeting notes... Type '/' for formatting options"
      />
    </div>
  );
}
```

---

## 7. Database Schema

### Prisma Schema Updates

Add JSON fields to store BlockNote content:

```prisma
model Thought {
  id        String   @id @default(cuid())
  content   Json     // BlockNote blocks stored as JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  // Optional: promote to Topic
  promotedToTopicId String?
  promotedToTopic   Topic?   @relation(fields: [promotedToTopicId], references: [id])
}

model Topic {
  id          String    @id @default(cuid())
  title       String
  content     Json      // BlockNote blocks stored as JSON
  status      TopicStatus @default(DRAFT)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  // Scheduled for meeting
  meetingId   String?
  meeting     Meeting?  @relation(fields: [meetingId], references: [id])
  
  // Origin thought
  thoughts    Thought[]
}

model Meeting {
  id        String   @id @default(cuid())
  date      DateTime
  notes     Json     // BlockNote blocks stored as JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Participants
  leaderId  String
  leader    User     @relation("LeaderMeetings", fields: [leaderId], references: [id])
  icId      String
  ic        User     @relation("ICMeetings", fields: [icId], references: [id])
  
  // Topics discussed
  topics    Topic[]
}

enum TopicStatus {
  DRAFT
  SCHEDULED
  DISCUSSED
  ARCHIVED
}
```

---

## 8. API Routes for Saving/Loading

### Example: Save Thought Content

`src/app/api/thoughts/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();

  const thought = await prisma.thought.update({
    where: {
      id: params.id,
      userId: session.user.id, // Ensure user owns this thought
    },
    data: {
      content, // BlockNote JSON blocks
    },
  });

  return NextResponse.json(thought);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thought = await prisma.thought.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!thought) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(thought);
}
```

---

## 9. Usage Example

### In a Page Component

```tsx
"use client";

import { useState, useEffect } from "react";
import { ThoughtsEditor } from "@/components/editor/ThoughtsEditor";
import { Block, PartialBlock } from "@blocknote/core";

export default function ThoughtPage({ params }: { params: { id: string } }) {
  const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Load thought content
  useEffect(() => {
    async function loadThought() {
      const response = await fetch(`/api/thoughts/${params.id}`);
      const thought = await response.json();
      setInitialContent(thought.content);
      setIsLoading(false);
    }
    loadThought();
  }, [params.id]);

  // Save handler with debounce
  const handleSave = async (thoughtId: string, blocks: Block[]) => {
    await fetch(`/api/thoughts/${thoughtId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: blocks }),
    });
  };

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-md bg-muted" />;
  }

  return (
    <ThoughtsEditor
      thoughtId={params.id}
      initialContent={initialContent}
      onSave={handleSave}
    />
  );
}
```

---

## 10. BlockNote Features to Leverage

### Available Block Types (Slash Menu)

BlockNote includes these block types out of the box:

- **Text** - Basic paragraph
- **Heading 1/2/3** - Headings with different levels
- **Bulleted List** - Unordered list items
- **Numbered List** - Ordered list items
- **Check List** - Todo items with checkboxes
- **Toggle List** - Collapsible list items
- **Quote** - Block quotes
- **Code Block** - Syntax highlighted code
- **Table** - Data tables
- **Image** - Image uploads (requires configuration)
- **File** - File attachments (requires configuration)

### Inline Formatting

- Bold, Italic, Underline, Strikethrough
- Code (inline)
- Links
- Text color and background color

### Document JSON Structure

```typescript
type Block = {
  id: string;
  type: string;
  props: Record<string, boolean | number | string>;
  content: InlineContent[] | TableContent | undefined;
  children: Block[];
};
```

---

## 11. Customization Options

### Custom Placeholder Text

```tsx
const editor = useCreateBlockNote({
  // Customize placeholder for empty blocks
  placeholders: {
    default: "Type '/' for commands...",
    heading: "Heading",
    bulletListItem: "List item",
    numberedListItem: "List item",
  },
});
```

### Theming

```tsx
<BlockNoteView
  editor={editor}
  theme="light" // or "dark"
/>
```

### Using Custom ShadCN Components

If you've customized your shadcn components:

```tsx
import * as Button from "@/components/ui/button";
import * as Select from "@/components/ui/select";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import * as Popover from "@/components/ui/popover";
import * as Tooltip from "@/components/ui/tooltip";

<BlockNoteView
  editor={editor}
  shadCNComponents={{
    Button,
    Select,
    DropdownMenu,
    Popover,
    Tooltip,
  }}
/>
```

> **Note:** Remove Portal usage from DropdownMenu, Popover, and Select components for compatibility.

---

## 12. Important Notes

### SSR Compatibility

- BlockNote is client-only and cannot be rendered on the server
- Always use dynamic imports with `ssr: false`
- Place editor components outside of `pages/` or `app/` directories

### React 19 / Next 15

- Disable `reactStrictMode` in `next.config.ts`
- This is a known compatibility issue being addressed by BlockNote

### Data Storage

- Store BlockNote content as JSON in your database
- The JSON structure is lossless and preserves all formatting
- Can be converted to HTML or Markdown if needed (with some loss)

### Performance

- BlockNote handles large documents efficiently
- Consider debouncing save operations (300-500ms recommended)
- Initial content should be loaded before rendering the editor

---

## 13. Additional Resources

- **BlockNote Documentation:** https://www.blocknotejs.org/docs
- **BlockNote Examples:** https://www.blocknotejs.org/examples
- **GitHub Repository:** https://github.com/TypeCellOS/BlockNote
- **Discord Community:** https://discord.com/invite/Qc2QTTH5dF

---

## 14. Implementation Checklist

- [ ] Install BlockNote packages
- [ ] Configure Tailwind CSS with BlockNote source
- [ ] Disable React Strict Mode in Next.js config
- [ ] Create base Editor component with "use client" directive
- [ ] Create DynamicEditor wrapper with dynamic import
- [ ] Create specialized editors (Thoughts, Topics, Meetings)
- [ ] Update Prisma schema with JSON content fields
- [ ] Create API routes for saving/loading content
- [ ] Implement debounced auto-save
- [ ] Test slash menu and formatting options
- [ ] Verify styling matches Wawanesa brand colors
