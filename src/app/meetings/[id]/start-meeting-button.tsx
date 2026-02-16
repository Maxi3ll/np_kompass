'use client';

import { useTransition } from 'react';
import { useUser } from '@/components/layout/user-context';
import { startMeeting } from '@/lib/supabase/actions';

interface StartMeetingButtonProps {
  meetingId: string;
  facilitatorId: string | null;
  isAdmin: boolean;
}

export function StartMeetingButton({ meetingId, facilitatorId, isAdmin }: StartMeetingButtonProps) {
  const { personId } = useUser();
  const [isPending, startTransition] = useTransition();

  const isFacilitator = personId === facilitatorId;
  const canStart = isFacilitator || isAdmin;

  if (!canStart) return null;

  function handleStart() {
    startTransition(async () => {
      await startMeeting(meetingId);
    });
  }

  return (
    <button
      onClick={handleStart}
      disabled={isPending}
      className="w-full py-3.5 rounded-2xl font-medium text-white bg-[var(--np-blue)] hover:bg-[var(--np-blue)]/90 transition-colors disabled:opacity-50 shadow-card"
    >
      {isPending ? 'Wird gestartet...' : 'Meeting starten'}
    </button>
  );
}
