import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getTaskById, getTaskComments } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { TaskActions } from "./task-actions";
import { TaskComments } from "./task-comments";

export const revalidate = 30;

const STATUS_CONFIG = {
  OPEN: { label: 'Offen', color: 'bg-[var(--status-new)]', textColor: 'text-white', description: 'Diese Aufgabe wurde noch nicht begonnen.' },
  IN_PROGRESS: { label: 'In Bearbeitung', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]', description: 'Jemand arbeitet daran.' },
  DONE: { label: 'Erledigt', color: 'bg-[var(--status-resolved)]', textColor: 'text-white', description: 'Diese Aufgabe wurde abgeschlossen.' },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Niedrig', color: 'text-muted-foreground', bg: 'bg-muted' },
  MEDIUM: { label: 'Mittel', color: 'text-amber-600', bg: 'bg-amber-100' },
  HIGH: { label: 'Hoch', color: 'text-red-600', bg: 'bg-red-100' },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AufgabeDetailPage({ params }: PageProps) {
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

  const [task, comments] = await Promise.all([
    getTaskById(id),
    getTaskComments(id),
  ]);

  if (!task) {
    notFound();
  }

  const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OPEN;
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;

  return (
    <AppShell>
      <Header title="Aufgabe" showBack backHref="/aufgaben" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Status Header */}
        <div className={`px-5 py-4 ${status.color}`}>
          <div className="max-w-2xl mx-auto lg:max-w-4xl flex items-center justify-between">
            <div>
              <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
              <p className={`text-xs ${status.textColor} opacity-80 mt-0.5`}>{status.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl mt-4 space-y-4">
          {/* Title & Description */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
            <h1 className="text-xl font-bold text-foreground">{task.title}</h1>
            {task.description && (
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Created By */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
            <p className="text-xs text-muted-foreground mb-2">Erstellt von</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: task.created_by_person?.avatar_color || '#4A90D9' }}
              >
                {task.created_by_person?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
              </div>
              <div>
                <p className="font-medium text-foreground">{task.created_by_person?.name || 'Unbekannt'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(task.created_at).toLocaleDateString('de-DE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned To */}
          {task.assigned_to_person && (
            <Link href={`/personen/${task.assigned_to_person.id}`}>
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
                <p className="text-xs text-muted-foreground mb-2">Zugewiesen an</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: task.assigned_to_person.avatar_color || '#6EC9A8' }}
                  >
                    {task.assigned_to_person?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{task.assigned_to_person?.name}</p>
                    {task.assigned_to_person?.email && (
                      <p className="text-xs text-muted-foreground">{task.assigned_to_person?.email}</p>
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
          {(task.start_date || task.end_date) && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-3">Zeitraum</p>
              <div className="flex gap-4">
                {task.start_date && (
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
                        {new Date(task.start_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
                {task.end_date && (
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
                        {new Date(task.end_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed info */}
          {task.status === 'DONE' && task.completed_at && (
            <div className="bg-[var(--status-resolved)]/10 rounded-2xl border border-[var(--status-resolved)]/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--status-resolved)] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--status-resolved)]">Abgeschlossen</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {new Date(task.completed_at).toLocaleDateString('de-DE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <TaskActions
              taskId={task.id}
              currentStatus={task.status}
              personId={personId || ""}
            />
          </div>

          {/* Comments */}
          <div className="pt-2">
            <TaskComments
              taskId={task.id}
              personId={personId || ""}
              initialComments={comments}
            />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
