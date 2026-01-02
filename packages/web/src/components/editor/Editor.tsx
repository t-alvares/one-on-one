import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./editor.css";

import { Block, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCallback, useEffect, useRef } from "react";

export interface EditorProps {
  initialContent?: PartialBlock[];
  onChange?: (blocks: Block[]) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * BlockNote Editor Component
 * Notion-like block-based editor
 */
export function Editor({
  initialContent,
  onChange,
  editable = true,
  className = "",
}: EditorProps) {
  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0
      ? initialContent
      : [{ type: "paragraph", content: "" }],
  });

  // Debounced save function (500ms)
  const debouncedSave = useCallback(
    (blocks: Block[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange?.(blocks);
      }, 500);
    },
    [onChange]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Handle content changes
  const handleChange = useCallback(() => {
    if (onChange) {
      debouncedSave(editor.document);
    }
  }, [editor, onChange, debouncedSave]);

  return (
    <div className={`blocknote-editor ${className}`}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}

export default Editor;
