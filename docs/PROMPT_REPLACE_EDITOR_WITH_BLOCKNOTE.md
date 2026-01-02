# Task: Replace Current Editor with BlockNote

## Objective

Replace the existing Tiptap-based block editor implementation with BlockNote for Thoughts, Topics, and Meeting Notes editors. BlockNote provides a more complete Notion-like experience out of the box with less custom code.

## Reference Document

Read and follow the implementation guide in `BLOCKNOTE_IMPLEMENTATION.md` before starting.

---

## Step 1: Remove Old Dependencies

Uninstall the current Tiptap packages:

```bash
pnpm remove @tiptap/core @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-image @tiptap/extension-code-block @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/pm @tiptap/suggestion
```

---

## Step 2: Install BlockNote

```bash
pnpm add @blocknote/core @blocknote/react @blocknote/shadcn
```

---

## Step 3: Update Next.js Config

In `next.config.ts`, disable React Strict Mode (required for BlockNote + React 19):

```typescript
const nextConfig = {
  reactStrictMode: false,
  // ... keep other existing config
};
```

---

## Step 4: Update Tailwind CSS

Add to your `globals.css` (or main CSS file):

```css
/* Add after your existing imports */
@source "../node_modules/@blocknote/shadcn";

/* Add BlockNote border styles */
@layer base {
  .bn-shadcn * {
    @apply border-border outline-ring/50;
  }
}
```

---

## Step 5: Create New Editor Components

### 5.1 Base Editor Component

Create `src/components/editor/Editor.tsx`:

```tsx
"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { Block, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCallback } from "react";

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
}: EditorProps) {
  const editor = useCreateBlockNote({
    initialContent: initialContent || [
      {
        type: "paragraph",
        content: "",
      },
    ],
  });

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
    />
  );
}
```

### 5.2 Dynamic Import Wrapper

Create `src/components/editor/DynamicEditor.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

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

### 5.3 Export from index

Create or update `src/components/editor/index.ts`:

```tsx
export { DynamicEditor } from "./DynamicEditor";
export { default as Editor } from "./Editor";
```

---

## Step 6: Update Existing Editor Usages

Find all places where the old Tiptap editor is used and replace with the new BlockNote editor.

### Pattern to Search For

Look for files importing from:
- `@tiptap/react`
- `@tiptap/core`
- Any custom editor components using Tiptap

### Replacement Pattern

**Before (Tiptap):**
```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit],
  content: initialContent,
  onUpdate: ({ editor }) => {
    onChange(editor.getJSON());
  },
});

return <EditorContent editor={editor} />;
```

**After (BlockNote):**
```tsx
import { DynamicEditor } from "@/components/editor";
import { Block, PartialBlock } from "@blocknote/core";

return (
  <DynamicEditor
    initialContent={initialContent as PartialBlock[]}
    onChange={(blocks: Block[]) => onChange(blocks)}
    editable={true}
  />
);
```

---

## Step 7: Update Components Using the Editor

### Thoughts Editor

Update the Thoughts page/component to use BlockNote:

```tsx
"use client";

import { DynamicEditor } from "@/components/editor";
import { Block, PartialBlock } from "@blocknote/core";
import { useCallback } from "react";

interface ThoughtEditorProps {
  thoughtId: string;
  initialContent?: PartialBlock[];
  onSave: (content: Block[]) => Promise<void>;
}

export function ThoughtEditor({ thoughtId, initialContent, onSave }: ThoughtEditorProps) {
  // Debounced save handler
  const handleChange = useCallback(
    async (blocks: Block[]) => {
      // Add debounce logic as needed
      await onSave(blocks);
    },
    [onSave]
  );

  return (
    <DynamicEditor
      initialContent={initialContent}
      onChange={handleChange}
      editable={true}
    />
  );
}
```

### Topics Editor

Same pattern as Thoughts:

```tsx
"use client";

import { DynamicEditor } from "@/components/editor";
import { Block, PartialBlock } from "@blocknote/core";

interface TopicEditorProps {
  topicId: string;
  initialContent?: PartialBlock[];
  onSave: (content: Block[]) => Promise<void>;
  readOnly?: boolean;
}

export function TopicEditor({ topicId, initialContent, onSave, readOnly = false }: TopicEditorProps) {
  return (
    <DynamicEditor
      initialContent={initialContent}
      onChange={onSave}
      editable={!readOnly}
    />
  );
}
```

### Meeting Notes Editor

```tsx
"use client";

import { DynamicEditor } from "@/components/editor";
import { Block, PartialBlock } from "@blocknote/core";

interface MeetingNotesEditorProps {
  meetingId: string;
  initialContent?: PartialBlock[];
  onSave: (content: Block[]) => Promise<void>;
  readOnly?: boolean;
}

export function MeetingNotesEditor({ meetingId, initialContent, onSave, readOnly = false }: MeetingNotesEditorProps) {
  return (
    <DynamicEditor
      initialContent={initialContent}
      onChange={onSave}
      editable={!readOnly}
    />
  );
}
```

---

## Step 8: Delete Old Editor Files

Remove any old Tiptap-specific editor components:

- Delete old editor component files that used Tiptap
- Delete any custom slash menu components (BlockNote has this built-in)
- Delete any custom toolbar components (BlockNote has this built-in)
- Delete Tiptap extension configurations

---

## Step 9: Verify Database Compatibility

The existing Prisma schema should already have JSON fields for content. Verify:

```prisma
model Thought {
  // ...
  content   Json     @default("[]")  // BlockNote stores as array of blocks
  // ...
}

model Topic {
  // ...
  content   Json     @default("[]")
  // ...
}

model Meeting {
  // ...
  notes     Json     @default("[]")
  // ...
}
```

BlockNote's JSON structure is compatible with the existing JSON field. No migration needed if content was stored as JSON array.

---

## Step 10: Test the Implementation

1. **Slash Commands**: Type `/` in the editor and verify the menu appears with:
   - Text (paragraph)
   - Heading 1, 2, 3
   - Bulleted List
   - Numbered List
   - Check List
   - Quote
   - Code Block
   - Table

2. **Inline Formatting**: Select text and verify toolbar appears with:
   - Bold
   - Italic
   - Underline
   - Strikethrough
   - Code
   - Link

3. **Save/Load**: 
   - Create content in Thoughts
   - Refresh the page
   - Verify content persists

4. **Navigation**:
   - Click a Thought to open full page view
   - Edit content
   - Go back to list
   - Re-open and verify changes saved

---

## Summary Checklist

- [ ] Removed Tiptap dependencies
- [ ] Installed BlockNote packages
- [ ] Disabled React Strict Mode
- [ ] Added BlockNote to Tailwind CSS source
- [ ] Created base Editor component with "use client"
- [ ] Created DynamicEditor wrapper with ssr: false
- [ ] Updated ThoughtsEditor to use BlockNote
- [ ] Updated TopicsEditor to use BlockNote
- [ ] Updated MeetingNotesEditor to use BlockNote
- [ ] Deleted old Tiptap editor files
- [ ] Verified database schema compatibility
- [ ] Tested slash commands
- [ ] Tested inline formatting
- [ ] Tested save/load functionality
