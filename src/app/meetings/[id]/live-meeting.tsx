'use client';

import { useEffect, useTransition, useCallback } from 'react';
import { useUser } from '@/components/layout/user-context';
import { useMeetingRealtime, type LiveMeetingState } from '@/hooks/use-meeting-realtime';
import { joinMeeting } from '@/lib/supabase/actions';
import type { MeetingPhase } from '@/types';
import { MeetingPhaseBar } from './components/meeting-phase-bar';
import { ParticipantList } from './components/participant-list';
import { FacilitatorControls } from './components/facilitator-controls';
import { CheckInPhase } from './live-phases/check-in-phase';
import { AgendaPhase } from './live-phases/agenda-phase';
import { ClosingPhase } from './live-phases/closing-phase';

interface LiveMeetingProps {
  meetingId: string;
  facilitatorId: string | null;
  initialData: LiveMeetingState;
}

export function LiveMeeting({ meetingId, facilitatorId, initialData }: LiveMeetingProps) {
  const { personId } = useUser();
  const { state, isConnected, dispatch } = useMeetingRealtime(meetingId, initialData);
  const [isPending, startTransition] = useTransition();

  const isFacilitator = personId === facilitatorId;
  const isAttendee = state.attendees.some(a => a.id === personId);

  // Auto-join when the meeting is active
  useEffect(() => {
    if (personId && !isAttendee && state.status === 'ACTIVE') {
      startTransition(async () => {
        await joinMeeting(meetingId, personId);
      });
    }
  }, [personId, isAttendee, state.status, meetingId]);

  // Find current agenda item
  const currentAgendaItem = state.agendaItems.find(
    i => i.position === state.currentAgendaPosition && !i.is_processed
  );
  const allItemsProcessed = state.agendaItems.length > 0 && state.agendaItems.every(i => i.is_processed);

  // Optimistically update phase in client state after successful server action
  const handlePhaseAdvanced = useCallback((nextPhase: MeetingPhase, firstPosition?: number | null) => {
    dispatch({ type: 'OPTIMISTIC_PHASE', payload: { phase: nextPhase, firstPosition } });
  }, [dispatch]);

  // Optimistically mark agenda item as processed
  const handleItemProcessed = useCallback((itemId: string, nextPosition: number | null) => {
    dispatch({ type: 'OPTIMISTIC_ITEM_PROCESSED', payload: { itemId, nextPosition } });
  }, [dispatch]);

  if (!personId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Bitte melde dich an, um am Meeting teilzunehmen.
      </div>
    );
  }

  // If meeting was completed via realtime, show a message
  if (state.status === 'COMPLETED') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[var(--status-resolved)]/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="font-semibold text-foreground mb-1">Meeting abgeschlossen</h3>
        <p className="text-sm text-muted-foreground">
          Das Protokoll wurde generiert. Seite wird aktualisiert...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection status banner */}
      {!isConnected && (
        <div className="p-3 rounded-lg bg-[var(--np-yellow)]/20 border border-[var(--np-yellow)]/30 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--np-yellow)] animate-pulse flex-shrink-0" />
          <p className="text-xs text-foreground">
            Verbindung unterbrochen — Daten werden evtl. nicht aktualisiert.
          </p>
        </div>
      )}

      {/* Phase Stepper */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50">
        <MeetingPhaseBar currentPhase={state.currentPhase} />
      </div>

      {/* Participant List */}
      <ParticipantList attendees={state.attendees} />

      {/* Phase Content */}
      {state.currentPhase === 'CHECK_IN' && (
        <CheckInPhase />
      )}

      {state.currentPhase === 'AGENDA' && (
        <AgendaPhase
          meetingId={meetingId}
          agendaItems={state.agendaItems}
          currentAgendaPosition={state.currentAgendaPosition}
          personId={personId}
          isFacilitator={isFacilitator}
        />
      )}

      {state.currentPhase === 'CLOSING' && (
        <ClosingPhase
          meetingId={meetingId}
          personId={personId}
          closings={state.closings}
        />
      )}

      {/* Facilitator Controls */}
      {isFacilitator && (
        <FacilitatorControls
          meetingId={meetingId}
          currentPhase={state.currentPhase}
          currentAgendaItemId={currentAgendaItem?.id}
          allItemsProcessed={allItemsProcessed}
          hasAgendaItems={state.agendaItems.length > 0}
          onPhaseAdvanced={handlePhaseAdvanced}
          onItemProcessed={handleItemProcessed}
        />
      )}
    </div>
  );
}
