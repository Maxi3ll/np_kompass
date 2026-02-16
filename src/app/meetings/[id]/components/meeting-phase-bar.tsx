'use client';

import { MEETING_PHASE_CONFIG, type MeetingPhase } from '@/types';

interface MeetingPhaseBarProps {
  currentPhase: MeetingPhase | null;
}

const PHASES: MeetingPhase[] = ['CHECK_IN', 'AGENDA', 'CLOSING'];

export function MeetingPhaseBar({ currentPhase }: MeetingPhaseBarProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {PHASES.map((phase, index) => {
        const config = MEETING_PHASE_CONFIG[phase];
        const currentIndex = currentPhase ? PHASES.indexOf(currentPhase) : -1;
        const isActive = phase === currentPhase;
        const isDone = currentIndex > index;

        return (
          <div key={phase} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-[var(--np-blue)] text-white ring-2 ring-[var(--np-blue)]/30'
                    : isDone
                      ? 'bg-[var(--status-resolved)] text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? '✓' : config.step}
              </div>
              <span
                className={`text-xs font-medium truncate ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {config.label}
              </span>
            </div>
            {index < PHASES.length - 1 && (
              <div
                className={`h-0.5 w-4 mx-1 flex-shrink-0 ${
                  isDone ? 'bg-[var(--status-resolved)]' : 'bg-muted'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
