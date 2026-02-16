'use client';

import { RoundEntryInput } from '../components/round-entry-input';

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
  const myEntry = closings.find(e => e.person_id === personId);

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">✅</span>
        <h3 className="font-semibold text-foreground">Abschlussrunde</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Wie war das Meeting für dich? Gibt es Verbesserungsvorschläge?
      </p>

      {/* Own input */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Dein Abschluss</p>
        <RoundEntryInput
          meetingId={meetingId}
          personId={personId}
          phase="CLOSING"
          existingContent={myEntry?.content}
        />
      </div>

      {/* Other entries */}
      {closings.filter(e => e.person_id !== personId).length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Andere Teilnehmer</p>
          <div className="space-y-2">
            {closings
              .filter(e => e.person_id !== personId)
              .map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: entry.person?.avatar_color || '#4A90D9' }}
                  >
                    {entry.person?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{entry.person?.name}</p>
                    <p className="text-sm text-foreground/80">{entry.content}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
