'use client';

import { useState, useTransition } from 'react';
import { saveRoundEntry } from '@/lib/supabase/actions';

interface RoundEntryInputProps {
  meetingId: string;
  personId: string;
  phase: 'CHECK_IN' | 'CLOSING';
  existingContent?: string;
}

export function RoundEntryInput({ meetingId, personId, phase, existingContent }: RoundEntryInputProps) {
  const [content, setContent] = useState(existingContent || '');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(!!existingContent);

  function handleSave() {
    if (!content.trim()) return;
    startTransition(async () => {
      const result = await saveRoundEntry(meetingId, personId, phase, content);
      if (result.success) {
        setSaved(true);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaved(false);
        }}
        placeholder={phase === 'CHECK_IN' ? 'Wie geht es dir? Was beschäftigt dich?' : 'Wie war das Meeting für dich?'}
        className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[60px]"
        disabled={isPending}
        rows={2}
      />
      <button
        onClick={handleSave}
        disabled={isPending || !content.trim()}
        className={`self-end px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${
          saved
            ? 'bg-[var(--status-resolved)] text-white'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isPending ? '...' : saved ? '✓' : 'Speichern'}
      </button>
    </div>
  );
}
