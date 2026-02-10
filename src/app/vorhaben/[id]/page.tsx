import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getVorhabenById } from "@/lib/supabase/queries";
import { getPersonsList } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/server";
import { VorhabenActions } from "./vorhaben-actions";
import { SubtaskCreateDialog } from "./subtask-create-dialog";

export const revalidate = 30;

const STATUS_CONFIG = {
  OPEN: { label: 'Offen', color: 'bg-[var(--status-new)]', textColor: 'text-white', description: 'Dieses Vorhaben wurde noch nicht begonnen.' },
  IN_PROGRESS: { label: 'In Umsetzung', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]', description: 'An diesem Vorhaben wird gearbeitet.' },
  DONE: { label: 'Abgeschlossen', color: 'bg-[var(--status-resolved)]', textColor: 'text-white', description: 'Dieses Vorhaben wurde abgeschlossen.' },
};

const SUBTASK_STATUS = {
  OPEN: { label: 'Offen', color: 'bg-[var(--status-new)]', textColor: 'text-white' },
  IN_PROGRESS: { label: 'In Arbeit', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]' },
  DONE: { label: 'Erledigt', color: 'bg-[var(--status-resolved)]', textColor: 'text-white' },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VorhabenDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let personId: string | null = null;
  if (user) {
    const { data: person } = await supabase
      .from("persons")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    personId = person?.id || null;
  }

  const [vorhaben, personsResult] = await Promise.all([
    getVorhabenById(id),
    getPersonsList(),
  ]);

  if (!vorhaben) {
    notFound();
  }

  const status = STATUS_CONFIG[vorhaben.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OPEN;
  const persons = personsResult.persons || [];

  const subtaskProgress = vorhaben.subtask_count > 0
    ? Math.round((vorhaben.subtask_done_count / vorhaben.subtask_count) * 100)
    : 0;

  return (
    <AppShell>
      <Header title="Vorhaben" showBack backHref="/vorhaben" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Status Header */}
        <div className={`px-5 py-4 ${status.color}`}>
          <div className="max-w-2xl mx-auto lg:max-w-4xl flex items-center justify-between">
            <div>
              <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
              <p className={`text-xs ${status.textColor} opacity-80 mt-0.5`}>{status.description}</p>
            </div>
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl mt-4 space-y-4">
          {/* Title & Description */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
            <h1 className="text-xl font-bold text-foreground">{vorhaben.title}</h1>
            {vorhaben.short_description && (
              <p className="text-sm text-primary font-medium mt-2">
                {vorhaben.short_description}
              </p>
            )}
            {vorhaben.description && (
              <p className="text-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap">
                {vorhaben.description}
              </p>
            )}
          </div>

          {/* Circle Badges */}
          {vorhaben.circles && vorhaben.circles.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-2">Beteiligte Kreise</p>
              <div className="flex flex-wrap gap-2">
                {vorhaben.circles.map((circle: any) => (
                  <Link
                    key={circle.id}
                    href={`/kreise/${circle.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: `${circle.color || '#4A90D9'}15`,
                      color: circle.color || '#4A90D9',
                    }}
                  >
                    {circle.icon} {circle.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Coordinator */}
          {vorhaben.coordinator && (
            <Link href={`/personen/${vorhaben.coordinator.id}`}>
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
                <p className="text-xs text-muted-foreground mb-2">Koordinator:in</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: vorhaben.coordinator.avatar_color || '#4A90D9' }}
                  >
                    {vorhaben.coordinator.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{vorhaben.coordinator.name}</p>
                    {vorhaben.coordinator.email && (
                      <p className="text-xs text-muted-foreground">{vorhaben.coordinator.email}</p>
                    )}
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </Link>
          )}

          {/* Dates */}
          {(vorhaben.start_date || vorhaben.end_date) && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-3">Zeitraum</p>
              <div className="flex gap-4">
                {vorhaben.start_date && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--np-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Start</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(vorhaben.start_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
                {vorhaben.end_date && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--np-yellow-light)] flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--np-yellow-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Ende</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(vorhaben.end_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <VorhabenActions
              vorhabenId={vorhaben.id}
              currentStatus={vorhaben.status}
            />
          </div>

          {/* Subtasks Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Unteraufgaben ({vorhaben.subtask_count || 0})
              </h3>
              {vorhaben.subtask_count > 0 && (
                <span className="text-xs text-muted-foreground">
                  {subtaskProgress}% erledigt
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {vorhaben.subtask_count > 0 && (
              <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-[var(--status-resolved)] rounded-full transition-all duration-500"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            )}

            {/* Subtask List */}
            <div className="space-y-2">
              {(vorhaben.subtasks || []).map((subtask: any) => {
                const st = SUBTASK_STATUS[subtask.status as keyof typeof SUBTASK_STATUS] || SUBTASK_STATUS.OPEN;
                return (
                  <Link
                    key={subtask.id}
                    href={`/vorhaben/${vorhaben.id}/unteraufgaben/${subtask.id}`}
                    className="block"
                  >
                    <div className="bg-card rounded-xl border border-border/50 p-3 transition-all hover:bg-muted/30 active:scale-[0.98]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          subtask.status === 'DONE' ? 'bg-[var(--status-resolved)]' :
                          subtask.status === 'IN_PROGRESS' ? 'bg-[var(--status-in-progress)]' :
                          'bg-[var(--status-new)]'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${subtask.status === 'DONE' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {subtask.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium ${st.color} ${st.textColor}`}>
                              {st.label}
                            </span>
                            {subtask.volunteer_count > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                {subtask.volunteer_count} Helfer
                              </span>
                            )}
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Add Subtask Button */}
            {personId && (
              <div className="mt-3">
                <SubtaskCreateDialog
                  vorhabenId={vorhaben.id}
                  personId={personId}
                  persons={persons}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
