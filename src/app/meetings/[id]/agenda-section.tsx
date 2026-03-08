'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { addAgendaItem, removeAgendaItem } from '@/lib/supabase/actions';
import { X, Plus } from 'lucide-react';

const PRIORITY_ICONS: Record<string, string> = {
  LOW: '○',
  MEDIUM: '◐',
  HIGH: '●',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Niedrig',
  MEDIUM: 'Mittel',
  HIGH: 'Hoch',
};

interface AgendaItem {
  id: string;
  notes: string | null;
  tension_id: string | null;
  tension: {
    id: string;
    title: string;
    status: string;
    priority: string;
  } | null;
}

interface OpenTension {
  id: string;
  title: string;
  priority: string;
  status: string;
}

interface AgendaSectionProps {
  meetingId: string;
  agendaItems: AgendaItem[];
  openTensions: OpenTension[];
  isPast: boolean;
}

export function AgendaSection({ meetingId, agendaItems, openTensions, isPast }: AgendaSectionProps) {
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAddFreeItem() {
    if (!notes.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addAgendaItem(meetingId, { notes: notes.trim() });
      if (result.error) {
        setError(result.error);
      } else {
        setNotes('');
      }
    });
  }

  function handleAddTension(tensionId: string) {
    setError(null);
    startTransition(async () => {
      const result = await addAgendaItem(meetingId, { tensionId });
      if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleRemove(agendaItemId: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeAgendaItem(agendaItemId, meetingId);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      {/* Agenda */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            Agenda ({agendaItems.length} {agendaItems.length === 1 ? 'Punkt' : 'Punkte'})
          </p>
        </div>

        {agendaItems.length > 0 ? (
          <div className="space-y-2">
            {agendaItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {item.tension ? (
                    <Link href={`/spannungen/${item.tension.id}`} className="hover:underline">
                      <p className="font-medium text-foreground">{item.tension.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${
                          item.tension.priority === 'HIGH' ? 'text-[var(--status-escalated)]' : 'text-muted-foreground'
                        }`}>
                          {PRIORITY_ICONS[item.tension.priority]} {PRIORITY_LABELS[item.tension.priority]}
                        </span>
                      </div>
                    </Link>
                  ) : item.notes ? (
                    <p className="text-foreground">{item.notes}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Kein Thema verknüpft</p>
                  )}
                </div>
                {!isPast && (
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={isPending}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 disabled:opacity-50"
                    title="Entfernen"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Noch keine Agenda-Punkte</p>
            {!isPast && (
              <p className="text-xs text-muted-foreground mt-1">
                Füge offene Spannungen oder freie Punkte zur Agenda hinzu
              </p>
            )}
          </div>
        )}

        {/* Add free agenda item */}
        {!isPast && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFreeItem();
                }
              }}
              placeholder="Freien Punkt hinzufügen..."
              maxLength={500}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isPending}
            />
            <button
              onClick={handleAddFreeItem}
              disabled={isPending || !notes.trim()}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? '...' : 'Hinzufügen'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Open Tensions to Add */}
      {!isPast && openTensions.length > 0 && (
        <div className="bg-[var(--np-yellow-light)] rounded-2xl border border-[var(--np-yellow)]/20 p-4">
          <p className="text-xs font-medium text-[#5a4a00] mb-3">
            Offene Spannungen in diesem Kreis ({openTensions.length})
          </p>
          <div className="space-y-2">
            {openTensions.map((tension) => (
              <div
                key={tension.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/50"
              >
                <button
                  onClick={() => handleAddTension(tension.id)}
                  disabled={isPending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--np-yellow)] text-[#5a4a00] hover:bg-[var(--np-yellow)]/80 transition-colors flex-shrink-0 disabled:opacity-50"
                  title="Zur Agenda hinzufügen"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
                <Link
                  href={`/spannungen/${tension.id}`}
                  className="flex-1 text-sm text-foreground truncate hover:underline"
                >
                  {tension.title}
                </Link>
                <span className={`text-xs flex-shrink-0 ${
                  tension.priority === 'HIGH' ? 'text-[var(--status-escalated)]' : 'text-muted-foreground'
                }`}>
                  {PRIORITY_ICONS[tension.priority]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
