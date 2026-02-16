'use client';

import { useEffect, useTransition } from 'react';
import { useUser } from '@/components/layout/user-context';
import { useMeetingRealtime, type LiveMeetingState } from '@/hooks/use-meeting-realtime';
import { joinMeeting } from '@/lib/supabase/actions';
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
  const state = useMeetingRealtime(meetingId, initialData);
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
    <div className={`space-y-4 ${isFacilitator ? 'pb-20' : ''}`}>
      {/* Phase Stepper */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50">
        <MeetingPhaseBar currentPhase={state.currentPhase} />
      </div>

      {/* Participant List */}
      <ParticipantList attendees={state.attendees} />

      {/* Phase Content */}
      {state.currentPhase === 'CHECK_IN' && (
        <CheckInPhase
          meetingId={meetingId}
          personId={personId}
          checkIns={state.checkIns}
        />
      )}

      {state.currentPhase === 'AGENDA' && (
        <AgendaPhase
          meetingId={meetingId}
          agendaItems={state.agendaItems}
          currentAgendaPosition={state.currentAgendaPosition}
          isFacilitator={isFacilitator}
          personId={personId}
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
        />
      )}
    </div>
  );
}
