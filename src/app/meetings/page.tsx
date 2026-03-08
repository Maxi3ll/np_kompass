import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getMeetings, getCircles } from "@/lib/supabase/queries";
import type { MeetingType, MeetingStatus } from "@/types";
import { MEETING_TYPE_CONFIG } from "@/types";
import { Clock, User, Calendar } from "lucide-react";

export const revalidate = 60;

interface MeetingListItem {
  id: string;
  date: string;
  type: MeetingType;
  status: MeetingStatus;
  circle_id: string;
  circle?: { id: string; name: string; color?: string; icon?: string };
  facilitator?: { id: string; name: string };
}

interface CircleListItem {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  parent_circle_id: string | null;
}

interface PageProps {
  searchParams: Promise<{ filter?: string; circle?: string }>;
}

export default async function MeetingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isUpcoming = params.filter !== "past";

  const [allMeetings, circles] = await Promise.all([
    getMeetings({
      upcoming: isUpcoming,
      past: !isUpcoming,
    }),
    getCircles(),
  ]) as [MeetingListItem[], CircleListItem[]];

  // All circles including Anker-Kreis
  const anchorCircle = circles.find((c) => c.parent_circle_id === null);
  const displayCircles = [
    ...(anchorCircle ? [anchorCircle] : []),
    ...circles.filter((c) => c.parent_circle_id !== null),
  ];

  // Circle counts
  const circleCounts: Record<string, number> = {};
  allMeetings.forEach((m) => {
    if (m.circle_id) circleCounts[m.circle_id] = (circleCounts[m.circle_id] || 0) + 1;
  });

  // Apply circle filter
  const meetings = params.circle
    ? allMeetings.filter((m) => m.circle_id === params.circle)
    : allMeetings;

  // Build hrefs preserving both filters
  const buildHref = (filter?: string, circleId?: string) => {
    const parts = [
      filter && `filter=${filter}`,
      circleId && `circle=${circleId}`,
    ].filter(Boolean);
    return `/meetings${parts.length ? `?${parts.join('&')}` : ''}`;
  };

  // Group meetings by date
  const groupedMeetings = meetings.reduce((groups: Record<string, MeetingListItem[]>, meeting) => {
    const date = new Date(meeting.date).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Berlin",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(meeting);
    return groups;
  }, {});

  return (
    <AppShell>
      <Header title="Termine" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Filter Tabs */}
        <div className="px-5 pt-4 pb-3 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="flex gap-2">
            <Link
              href={buildHref(undefined, params.circle)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all ${
                isUpcoming
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Anstehend
            </Link>
            <Link
              href={buildHref("past", params.circle)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all ${
                !isUpcoming
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Vergangen
            </Link>
          </div>

          {/* Circle Filter - Color-dot chips */}
          <div className="flex gap-1.5 overflow-x-auto pt-3 pb-2 -mx-5 px-5 scrollbar-hide">
            <Link
              href={buildHref(isUpcoming ? undefined : "past", undefined)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !params.circle
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-foreground/40 flex-shrink-0" />
              Alle Kreise ({allMeetings.length})
            </Link>
            {displayCircles.map((circle) => {
              const count = circleCounts[circle.id] || 0;
              if (count === 0) return null;
              const isActive = params.circle === circle.id;
              return (
                <Link
                  key={circle.id}
                  href={buildHref(isUpcoming ? undefined : "past", circle.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  style={isActive ? { backgroundColor: `${circle.color}18` } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: circle.color || "#4A90D9" }}
                  />
                  {circle.name} ({count})
                </Link>
              );
            })}
          </div>
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
                    {(dateMeetings as MeetingListItem[]).map((meeting) => {
                      const typeConfig = MEETING_TYPE_CONFIG[meeting.type as keyof typeof MEETING_TYPE_CONFIG];
                      const meetingTime = new Date(meeting.date).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Berlin",
                      });

                      const isActiveMeeting = meeting.status === 'ACTIVE';
                      const isCompletedMeeting = meeting.status === 'COMPLETED';

                      return (
                        <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="block">
                          <div className={`bg-card rounded-2xl shadow-card border overflow-hidden transition-all card-lift active:scale-[0.98] ${
                            isActiveMeeting ? 'border-[var(--np-yellow)] ring-2 ring-[var(--np-yellow)]/20' : 'border-border/50'
                          }`}>
                            {/* Colored top border */}
                            <div
                              className="h-1"
                              style={{ backgroundColor: isActiveMeeting ? 'var(--np-yellow)' : (meeting.circle?.color || "#4A90D9") }}
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
                                      <Clock size={14} />
                                      {meetingTime} Uhr
                                    </span>
                                    {meeting.facilitator && (
                                      <span className="flex items-center gap-1">
                                        <User size={14} />
                                        {meeting.facilitator.name?.split(" ")[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span
                                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.bgClass} ${typeConfig.textClass}`}
                                  >
                                    {typeConfig.label}
                                  </span>
                                  {isActiveMeeting && (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--np-yellow)] text-[#5a4a00] animate-pulse">
                                      Live
                                    </span>
                                  )}
                                  {isCompletedMeeting && (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--status-resolved)] text-white">
                                      Abgeschlossen
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isActiveMeeting && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                  <span className="text-xs font-medium text-[var(--np-blue)]">
                                    Meeting beitreten →
                                  </span>
                                </div>
                              )}
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
                <Calendar size={32} className="text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">
                {isUpcoming ? "Keine anstehenden Termine" : "Keine vergangenen Termine"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isUpcoming ? "Termine werden hier angezeigt, sobald sie geplant sind." : "Vergangene Termine erscheinen hier nach Abschluss."}
              </p>
            </div>
          )}
        </div>

      </main>

    </AppShell>
  );
}
