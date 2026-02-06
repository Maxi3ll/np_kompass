import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getMeetings, getCircles } from "@/lib/supabase/queries";

export const revalidate = 60;

const MEETING_TYPE_CONFIG = {
  TACTICAL: { label: "Taktisch", color: "bg-[var(--np-blue)]", textColor: "text-white" },
  GOVERNANCE: { label: "Governance", color: "bg-[var(--circle-finanzen)]", textColor: "text-white" },
};

interface PageProps {
  searchParams: Promise<{ filter?: string; circle?: string }>;
}

export default async function MeetingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isUpcoming = params.filter !== "past";

  const [meetings, circles] = await Promise.all([
    getMeetings({
      upcoming: isUpcoming,
      past: !isUpcoming,
      circleId: params.circle,
    }),
    getCircles(),
  ]);

  // Filter out Anker-Kreis
  const displayCircles = circles.filter((c: any) => c.parent_circle_id !== null);

  // Group meetings by date
  const groupedMeetings = meetings.reduce((groups: Record<string, any[]>, meeting: any) => {
    const date = new Date(meeting.date).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(meeting);
    return groups;
  }, {});

  return (
    <AppShell>
      <Header title="Meetings" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Filter Tabs */}
        <div className="px-5 pt-4 pb-3 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="flex gap-2">
            <Link
              href="/meetings"
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all ${
                isUpcoming
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Anstehend
            </Link>
            <Link
              href="/meetings?filter=past"
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all ${
                !isUpcoming
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Vergangen
            </Link>
          </div>

          {/* Circle Filter */}
          {params.circle && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Gefiltert nach:</span>
              <Link
                href={isUpcoming ? "/meetings" : "/meetings?filter=past"}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs font-medium"
              >
                {displayCircles.find((c: any) => c.id === params.circle)?.name || "Kreis"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Meetings List */}
        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
          {Object.keys(groupedMeetings).length > 0 ? (
            <div className="space-y-6 stagger-fade-in">
              {Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {(dateMeetings as any[]).map((meeting: any) => {
                      const typeConfig = MEETING_TYPE_CONFIG[meeting.type as keyof typeof MEETING_TYPE_CONFIG];
                      const meetingTime = new Date(meeting.date).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="block">
                          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden transition-all card-lift active:scale-[0.98]">
                            {/* Colored top border */}
                            <div
                              className="h-1"
                              style={{ backgroundColor: meeting.circle?.color || "#4A90D9" }}
                            />
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{meeting.circle?.icon || "⭕"}</span>
                                    <h3 className="font-semibold text-foreground truncate">
                                      {meeting.circle?.name}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                      {meetingTime} Uhr
                                    </span>
                                    {meeting.facilitator && (
                                      <span className="flex items-center gap-1">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                          <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        {meeting.facilitator.name?.split(" ")[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.color} ${typeConfig.textColor}`}
                                >
                                  {typeConfig.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="font-medium text-foreground">
                {isUpcoming ? "Keine anstehenden Meetings" : "Keine vergangenen Meetings"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isUpcoming ? "Meetings werden hier angezeigt, sobald sie geplant sind." : ""}
              </p>
            </div>
          )}
        </div>

      </main>

    </AppShell>
  );
}
