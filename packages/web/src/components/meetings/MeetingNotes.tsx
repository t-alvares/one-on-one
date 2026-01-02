import { useCallback, useMemo } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { BlockEditor } from '../editor';
import { useMeetingNotes, useUpdateMeetingNotes } from '../../hooks/useMeetingNotes';
import type { Block } from '@blocknote/core';

interface MeetingNotesProps {
  meetingId: string;
  isReadOnly?: boolean;
}

/**
 * MeetingNotes Component
 * Right column of the meeting page showing shared notes
 * - BlockNote editor for collaborative notes
 * - Auto-save on change (debounced in BlockEditor)
 * - Shows last edited indicator
 * - Both Leader and IC can edit
 */
export function MeetingNotes({ meetingId, isReadOnly = false }: MeetingNotesProps) {
  const { data: notes, isLoading } = useMeetingNotes(meetingId);
  const updateNotes = useUpdateMeetingNotes(meetingId);

  // Handle content changes - auto-save
  const handleContentChange = useCallback(
    (blocks: Block[]) => {
      updateNotes.mutate({ content: blocks as unknown as Record<string, unknown> });
    },
    [updateNotes]
  );

  // Format last edited time
  const lastEditedText = useMemo(() => {
    if (!notes?.lastEditedBy || !notes?.lastEditedAt) return null;
    const date = new Date(notes.lastEditedAt);
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `Last edited by ${notes.lastEditedBy.name} at ${time}`;
  }, [notes?.lastEditedBy, notes?.lastEditedAt]);

  // Convert notes content to blocks format
  const initialContent = useMemo(() => {
    if (!notes?.content) return undefined;
    // If content is an array, use it directly; otherwise treat as empty
    if (Array.isArray(notes.content)) {
      return notes.content.length > 0 ? notes.content : undefined;
    }
    return undefined;
  }, [notes?.content]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-text-secondary" />
          <h2 className="text-base font-medium text-text-secondary tracking-wide">
            Meeting Notes
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary tracking-wide">
          <FileText className="w-5 h-5" />
          Meeting Notes
        </h2>

        {/* Saving indicator */}
        {updateNotes.isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving
          </span>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 bg-white border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <BlockEditor
            key={meetingId}
            initialContent={initialContent}
            onChange={handleContentChange}
            editable={!isReadOnly}
            className="min-h-[300px]"
          />
        </div>

        {/* Last edited indicator */}
        {lastEditedText && (
          <div className="px-4 py-2 border-t border-border/50 bg-surface-secondary/30">
            <p className="text-xs text-text-tertiary">{lastEditedText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingNotes;
