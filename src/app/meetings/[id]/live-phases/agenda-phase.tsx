'use client';

import { useTransition } from 'react';
import { processAgendaItem } from '@/lib/supabase/actions';
import { AgendaItemLive } from '../components/agenda-item-live';

interface AgendaPhaseProps {
  meetingId: string;
  agendaItems: any[];
  currentAgendaPosition: number | null;
  isFacilitator: boolean;
  personId: string;
}

export function AgendaPhase({
  meetingId,
  agendaItems,
  currentAgendaPosition,
  isFacilitator,
  personId,
}: AgendaPhaseProps) {
  const [isPending, startTransition] = useTransition();

  function handleProcess(agendaItemId: string) {
    startTransition(async () => {
      await processAgendaItem(meetingId, agendaItemId);
    });
  }

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
              isFacilitator={isFacilitator}
              personId={personId}
              onProcess={() => handleProcess(item.id)}
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
