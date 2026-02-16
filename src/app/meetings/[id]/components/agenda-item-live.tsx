'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { updateAgendaItemOutcome, addMeetingAgendaComment } from '@/lib/supabase/actions';

interface AgendaComment {
  id: string;
  person_id: string;
  content: string;
  created_at: string;
  person?: { id: string; name: string; avatar_color?: string };
}

interface AgendaItemLiveProps {
  item: {
    id: string;
    position: number;
    notes: string | null;
    is_processed: boolean;
    outcome: string | null;
    tension?: { id: string; title: string; status: string; priority: string } | null;
    comments: AgendaComment[];
  };
  isCurrent: boolean;
  isFacilitator: boolean;
  personId: string;
  onProcess: () => void;
}

export function AgendaItemLive({ item, isCurrent, isFacilitator, personId, onProcess }: AgendaItemLiveProps) {
  const [outcome, setOutcome] = useState(item.outcome || '');
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const outcomeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const title = item.tension?.title || item.notes || 'Unbenannter Punkt';

  // Update outcome with debounce
  useEffect(() => {
    if (outcome === (item.outcome || '')) return;
    if (outcomeTimer.current) clearTimeout(outcomeTimer.current);
    outcomeTimer.current = setTimeout(() => {
      updateAgendaItemOutcome(item.id, outcome);
    }, 800);
    return () => {
      if (outcomeTimer.current) clearTimeout(outcomeTimer.current);
    };
  }, [outcome, item.id, item.outcome]);

  function handleAddComment() {
    if (!comment.trim()) return;
    startTransition(async () => {
      await addMeetingAgendaComment(item.id, personId, comment);
      setComment('');
    });
  }

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isCurrent
          ? 'bg-[var(--np-yellow-light)] border-[var(--np-yellow)]/30 shadow-md'
          : item.is_processed
            ? 'bg-muted/30 border-border/30 opacity-75'
            : 'bg-card border-border/50'
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
              item.is_processed
                ? 'bg-[var(--status-resolved)] text-white'
                : isCurrent
                  ? 'bg-[var(--np-blue)] text-white'
                  : 'bg-primary/10 text-primary'
            }`}
          >
            {item.is_processed ? '✓' : item.position}
          </span>
          <div className="flex-1 min-w-0">
            {item.tension ? (
              <Link href={`/spannungen/${item.tension.id}`} className="hover:underline">
                <p className="font-medium text-foreground">{title}</p>
              </Link>
            ) : (
              <p className="font-medium text-foreground">{title}</p>
            )}
          </div>
          {isCurrent && isFacilitator && !item.is_processed && (
            <button
              onClick={onProcess}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--status-resolved)] text-white hover:bg-[var(--status-resolved)]/90 transition-colors"
            >
              Abhaken
            </button>
          )}
        </div>

        {/* Outcome (editable when current) */}
        {(isCurrent || item.outcome) && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Ergebnis / Notizen</p>
            {isCurrent ? (
              <textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Ergebnis, Entscheidung oder nächste Schritte..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
              />
            ) : item.outcome ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{item.outcome}</p>
            ) : null}
          </div>
        )}
      </div>

      {/* Comments (visible when current or has comments) */}
      {(isCurrent || item.comments.length > 0) && (
        <div className="border-t border-border/30 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-2">
            Kommentare ({item.comments.length})
          </p>

          {item.comments.length > 0 && (
            <div className="space-y-2 mb-3">
              {item.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: c.person?.avatar_color || '#4A90D9' }}
                  >
                    {c.person?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">
                      <span className="font-medium">{c.person?.name}</span>{' '}
                      <span className="text-muted-foreground">
                        {new Date(c.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    <p className="text-sm text-foreground">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isCurrent && (
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Kommentar..."
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isPending}
              />
              <button
                onClick={handleAddComment}
                disabled={isPending || !comment.trim()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPending ? '...' : 'Senden'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
