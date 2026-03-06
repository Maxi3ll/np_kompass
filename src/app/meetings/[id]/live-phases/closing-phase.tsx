'use client';

import { RoundPhase } from '../components/round-phase';

interface RoundEntry {
  id: string;
  person_id: string;
  content: string;
  person?: { id: string; name: string; avatar_color?: string };
}

interface ClosingPhaseProps {
  meetingId: string;
  personId: string;
  closings: RoundEntry[];
}

export function ClosingPhase({ meetingId, personId, closings }: ClosingPhaseProps) {
  return (
    <RoundPhase
      meetingId={meetingId}
      personId={personId}
      phase="CLOSING"
      entries={closings}
      icon="✅"
      title="Abschlussrunde"
      description="Wie war das Meeting für dich? Gibt es Verbesserungsvorschläge?"
      ownLabel="Dein Abschluss"
    />
  );
}
