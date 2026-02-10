'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { addAgendaItem, removeAgendaItem } from '@/lib/supabase/actions';

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

  function handleAddFreeItem() {
    if (!notes.trim()) return;
    startTransition(async () => {
      await addAgendaItem(meetingId, { notes: notes.trim() });
      setNotes('');
    });
  }

  function handleAddTension(tensionId: string) {
    startTransition(async () => {
      await addAgendaItem(meetingId, { tensionId });
    });
  }

  function handleRemove(agendaItemId: string) {
    startTransition(async () => {
      await removeAgendaItem(agendaItemId, meetingId);
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
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
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
                    className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 disabled:opacity-50"
                    title="Entfernen"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
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
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isPending}
            />
            <button
              onClick={handleAddFreeItem}
              disabled={isPending || !notes.trim()}
              className="px-3 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? '...' : 'Hinzufügen'}
            </button>
          </div>
        )}
      </div>

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
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--np-yellow)] text-[#5a4a00] hover:bg-[var(--np-yellow)]/80 transition-colors flex-shrink-0 disabled:opacity-50"
                  title="Zur Agenda hinzufügen"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
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
