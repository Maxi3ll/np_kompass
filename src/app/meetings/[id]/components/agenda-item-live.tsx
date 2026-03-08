'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { updateAgendaItemOutcome } from '@/lib/supabase/actions';

interface AgendaItemLiveProps {
  item: {
    id: string;
    position: number;
    notes: string | null;
    is_processed: boolean;
    outcome: string | null;
    tension?: { id: string; title: string; status: string; priority: string } | null;
  };
  isCurrent: boolean;
  isFacilitator: boolean;
}

export function AgendaItemLive({ item, isCurrent, isFacilitator }: AgendaItemLiveProps) {
  const [outcome, setOutcome] = useState(item.outcome || '');
  const [error, setError] = useState<string | null>(null);
  const outcomeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const title = item.tension?.title || item.notes || 'Unbenannter Punkt';

  // Update outcome with debounce
  useEffect(() => {
    if (outcome === (item.outcome || '')) return;
    if (outcomeTimer.current) clearTimeout(outcomeTimer.current);
    outcomeTimer.current = setTimeout(async () => {
      const result = await updateAgendaItemOutcome(item.id, outcome);
      if (result?.error) setError(result.error);
    }, 800);
    return () => {
      if (outcomeTimer.current) clearTimeout(outcomeTimer.current);
    };
  }, [outcome, item.id, item.outcome]);

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
        </div>

        {/* Outcome: editable for facilitator when current, read-only otherwise */}
        {(isFacilitator && isCurrent) && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Ergebnis / Notizen</p>
            {error && (
              <p className="text-xs text-destructive mb-1">{error}</p>
            )}
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Ergebnis, Entscheidung oder nächste Schritte..."
              maxLength={5000}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
            />
          </div>
        )}

        {(!isFacilitator || !isCurrent) && item.outcome && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Ergebnis / Notizen</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{item.outcome}</p>
          </div>
        )}
      </div>
    </div>
  );
}
