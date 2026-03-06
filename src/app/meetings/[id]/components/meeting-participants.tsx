interface Facilitator {
  id: string;
  name?: string;
  email?: string;
}

interface Attendee {
  id: string;
  name?: string;
}

interface MeetingParticipantsProps {
  facilitator?: Facilitator | null;
  attendees?: Attendee[] | null;
  showEmail?: boolean;
}

export function MeetingParticipants({ facilitator, attendees, showEmail = false }: MeetingParticipantsProps) {
  return (
    <>
      {facilitator && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
          <p className="text-xs text-muted-foreground mb-2">Moderation</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              {facilitator.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="font-medium text-foreground">{facilitator.name}</p>
              {showEmail && facilitator.email && (
                <p className="text-xs text-muted-foreground">{facilitator.email}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {attendees && attendees.length > 0 && (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
          <p className="text-xs text-muted-foreground mb-3">
            Teilnehmer ({attendees.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {attendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium">
                  {attendee.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <span className="text-sm">{attendee.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
