'use client';

interface Participant {
  id: string;
  name: string;
  avatar_color?: string;
}

interface ParticipantListProps {
  attendees: Participant[];
}

export function ParticipantList({ attendees }: ParticipantListProps) {
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
      <p className="text-xs text-muted-foreground mb-3">
        Teilnehmer ({attendees.length})
      </p>
      {attendees.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {attendees.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: person.avatar_color || '#4A90D9' }}
              >
                {person.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <span className="text-sm">{person.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Noch keine Teilnehmer</p>
      )}
    </div>
  );
}
