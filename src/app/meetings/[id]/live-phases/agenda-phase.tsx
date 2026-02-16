'use client';

import { AgendaItemLive } from '../components/agenda-item-live';

interface AgendaPhaseProps {
  meetingId: string;
  agendaItems: any[];
  currentAgendaPosition: number | null;
  personId: string;
}

export function AgendaPhase({
  agendaItems,
  currentAgendaPosition,
  personId,
}: AgendaPhaseProps) {
  const unprocessedCount = agendaItems.filter(i => !i.is_processed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">📋</span>
        <h3 className="font-semibold text-foreground">Agenda</h3>
        <span className="text-xs text-muted-foreground">
          ({agendaItems.length - unprocessedCount}/{agendaItems.length} erledigt)
        </span>
      </div>

      {agendaItems.length > 0 ? (
        <div className="space-y-3">
          {agendaItems.map((item) => (
            <AgendaItemLive
              key={item.id}
              item={item}
              isCurrent={item.position === currentAgendaPosition && !item.is_processed}
              personId={personId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Keine Agenda-Punkte vorhanden
        </div>
      )}
    </div>
  );
}
