'use client';

import { RoundPhase } from '../components/round-phase';

interface RoundEntry {
  id: string;
  person_id: string;
  content: string;
  person?: { id: string; name: string; avatar_color?: string };
}

interface CheckInPhaseProps {
  meetingId: string;
  personId: string;
  checkIns: RoundEntry[];
}

export function CheckInPhase({ meetingId, personId, checkIns }: CheckInPhaseProps) {
  return (
    <RoundPhase
      meetingId={meetingId}
      personId={personId}
      phase="CHECK_IN"
      entries={checkIns}
      icon="👋"
      title="Check-in Runde"
      description="Wie geht es dir? Teile kurz mit, was dich gerade beschäftigt."
      ownLabel="Dein Check-in"
    />
  );
}
