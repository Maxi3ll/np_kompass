import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getMeetingById } from "@/lib/supabase/queries";
import { AgendaSection } from "./agenda-section";

export const revalidate = 30;

const MEETING_TYPE_CONFIG = {
  TACTICAL: {
    label: "Taktischer Termin",
    description: "Operative Abstimmung und Status-Updates",
    color: "var(--np-blue)",
  },
  GOVERNANCE: {
    label: "Governance-Termin",
    description: "Strukturelle Änderungen und Rollen-Anpassungen",
    color: "var(--circle-finanzen)",
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const meeting = await getMeetingById(id);

  if (!meeting) {
    notFound();
  }

  const typeConfig = MEETING_TYPE_CONFIG[meeting.type as keyof typeof MEETING_TYPE_CONFIG];
  const meetingDate = new Date(meeting.date);
  const isPast = meetingDate < new Date();
  const isToday = meetingDate.toDateString() === new Date().toDateString();

  return (
    <AppShell>
      <Header title="Termin" showBack backHref="/meetings" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Meeting Header */}
        <div
          className="px-5 py-5"
          style={{ backgroundColor: `color-mix(in srgb, ${meeting.circle?.color || "#4A90D9"} 15%, transparent)` }}
        >
          <div className="max-w-2xl mx-auto lg:max-w-4xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{meeting.circle?.icon || "⭕"}</span>
              <div>
                <h1 className="text-xl font-bold text-foreground">{meeting.circle?.name}</h1>
                <p className="text-sm text-muted-foreground">{typeConfig.label}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: meeting.circle?.color || "#4A90D9" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isToday ? "Heute" : meetingDate.toLocaleDateString("de-DE", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {meetingDate.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                  </p>
                </div>
              </div>

              {isPast && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Vergangen
                </span>
              )}
              {isToday && !isPast && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--np-yellow)] text-[#5a4a00]">
                  Heute
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl mt-4 space-y-4">
          {/* Facilitator */}
          {meeting.facilitator && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-2">Moderation</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {meeting.facilitator.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{meeting.facilitator.name}</p>
                  {meeting.facilitator.email && (
                    <p className="text-xs text-muted-foreground">{meeting.facilitator.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attendees */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-3">
                Teilnehmer ({meeting.attendees.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {meeting.attendees.map((attendee: any) => (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium">
                      {attendee.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm">{attendee.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agenda + Open Tensions */}
          <AgendaSection
            meetingId={meeting.id}
            agendaItems={meeting.agendaItems}
            openTensions={meeting.openTensions}
            isPast={isPast}
          />

          {/* Notes */}
          {meeting.notes && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-2">Notizen</p>
              <p className="text-foreground whitespace-pre-wrap">{meeting.notes}</p>
            </div>
          )}

          {/* Circle Link */}
          <Link href={`/kreise/${meeting.circle?.id}`}>
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${meeting.circle?.color}20` }}
                >
                  {meeting.circle?.icon || "⭕"}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Zum Kreis</p>
                  <p className="font-medium text-foreground">{meeting.circle?.name}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </main>

    </AppShell>
  );
}
