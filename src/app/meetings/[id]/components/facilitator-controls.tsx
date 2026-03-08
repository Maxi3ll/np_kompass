'use client';

import { useTransition } from 'react';
import { advanceMeetingPhase, processAgendaItem } from '@/lib/supabase/actions';
import type { MeetingPhase } from '@/types';

interface FacilitatorControlsProps {
  meetingId: string;
  currentPhase: MeetingPhase | null;
  currentAgendaItemId?: string;
  allItemsProcessed: boolean;
  hasAgendaItems: boolean;
  onPhaseAdvanced?: (nextPhase: MeetingPhase, firstPosition?: number | null) => void;
  onItemProcessed?: (itemId: string, nextPosition: number | null) => void;
}

export function FacilitatorControls({
  meetingId,
  currentPhase,
  currentAgendaItemId,
  allItemsProcessed,
  hasAgendaItems,
  onPhaseAdvanced,
  onItemProcessed,
}: FacilitatorControlsProps) {
  const [isPending, startTransition] = useTransition();

  function handleAdvance() {
    if (currentPhase === 'CLOSING') {
      if (!confirm('Meeting abschliessen? Das Protokoll wird generiert und kann nicht rückgängig gemacht werden.')) return;
    }
    startTransition(async () => {
      try {
        const result = await advanceMeetingPhase(meetingId);
        if (result?.error) {
          alert(result.error);
        } else if ('nextPhase' in result && result.nextPhase) {
          onPhaseAdvanced?.(result.nextPhase as MeetingPhase, result.firstPosition);
        }
      } catch {
        alert('Fehler beim Phasenwechsel. Bitte Seite neu laden.');
      }
    });
  }

  function handleProcessItem() {
    if (!currentAgendaItemId) return;
    const itemId = currentAgendaItemId;
    startTransition(async () => {
      try {
        const result = await processAgendaItem(meetingId, itemId);
        if (result?.error) {
          alert(result.error);
        } else if ('processedItemId' in result) {
          onItemProcessed?.(itemId, result.nextPosition);

          // Auto-advance to closing when all agenda items are processed
          if (result.nextPosition === null) {
            const advanceResult = await advanceMeetingPhase(meetingId);
            if (advanceResult && !advanceResult.error && 'nextPhase' in advanceResult && advanceResult.nextPhase) {
              onPhaseAdvanced?.(advanceResult.nextPhase as MeetingPhase, advanceResult.firstPosition);
            }
          }
        }
      } catch {
        alert('Fehler beim Verarbeiten. Bitte Seite neu laden.');
      }
    });
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-64 z-40 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="max-w-2xl mx-auto lg:max-w-4xl px-5 py-3 flex items-center gap-3">
        <div className="flex-1 text-xs text-muted-foreground">
          Moderator-Steuerung
        </div>

        {currentPhase === 'CHECK_IN' && (
          <button
            onClick={handleAdvance}
            disabled={isPending}
            className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[var(--np-blue)] text-white hover:bg-[var(--np-blue)]/90 transition-colors disabled:opacity-50"
          >
            {isPending ? '...' : 'Weiter zur Agenda →'}
          </button>
        )}

        {currentPhase === 'AGENDA' && (
          <div className="flex items-center gap-2">
            {currentAgendaItemId && (
              <button
                onClick={handleProcessItem}
                disabled={isPending}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[var(--status-resolved)] text-white hover:bg-[var(--status-resolved)]/90 transition-colors disabled:opacity-50"
              >
                {isPending ? '...' : 'Punkt abschliessen'}
              </button>
            )}
            {!hasAgendaItems && (
              <button
                onClick={handleAdvance}
                disabled={isPending}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[var(--np-blue)] text-white hover:bg-[var(--np-blue)]/90 transition-colors disabled:opacity-50"
              >
                {isPending ? '...' : 'Zur Abschlussrunde →'}
              </button>
            )}
          </div>
        )}

        {currentPhase === 'CLOSING' && (
          <button
            onClick={handleAdvance}
            disabled={isPending}
            className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[var(--status-resolved)] text-white hover:bg-[var(--status-resolved)]/90 transition-colors disabled:opacity-50"
          >
            {isPending ? '...' : 'Meeting abschliessen ✓'}
          </button>
        )}
      </div>
    </div>
  );
}
