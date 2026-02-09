import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getTasks } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

const STATUS_CONFIG = {
  OPEN: { label: 'Offen', color: 'bg-[var(--status-new)]', textColor: 'text-white' },
  IN_PROGRESS: { label: 'In Bearbeitung', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]' },
  DONE: { label: 'Erledigt', color: 'bg-[var(--status-resolved)]', textColor: 'text-white' },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Niedrig', icon: '○' },
  MEDIUM: { label: 'Mittel', icon: '◐' },
  HIGH: { label: 'Hoch', icon: '●' },
};

interface PageProps {
  searchParams: Promise<{ status?: string; assigned?: string }>;
}

export default async function AufgabenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const allTasks = await getTasks();

  // Get current user's person ID for "Mir zugewiesen" filter
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let personId: string | undefined;
  if (user) {
    const { data: person } = await supabase
      .from("persons")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    personId = person?.id;
  }

  // Apply assignment filter first
  const assignmentFiltered = params.assigned === "me" && personId
    ? allTasks.filter((t: any) => t.assigned_to === personId)
    : allTasks;

  // Status counts from assignment-filtered tasks
  const statusCounts = {
    all: assignmentFiltered.length,
    OPEN: assignmentFiltered.filter((t: any) => t.status === 'OPEN').length,
    IN_PROGRESS: assignmentFiltered.filter((t: any) => t.status === 'IN_PROGRESS').length,
    DONE: assignmentFiltered.filter((t: any) => t.status === 'DONE').length,
  };

  // Assignment counts from status-filtered tasks
  const statusFiltered = params.status
    ? allTasks.filter((t: any) => t.status === params.status)
    : allTasks;
  const allCount = statusFiltered.length;
  const myCount = personId
    ? statusFiltered.filter((t: any) => t.assigned_to === personId).length
    : 0;

  // Apply both filters for display
  const tasks = params.status
    ? assignmentFiltered.filter((t: any) => t.status === params.status)
    : assignmentFiltered;

  const buildHref = (status?: string, assigned?: string) => {
    const parts = [
      status && `status=${status}`,
      assigned && `assigned=${assigned}`,
    ].filter(Boolean);
    return `/aufgaben${parts.length ? `?${parts.join('&')}` : ''}`;
  };

  return (
    <AppShell>
      <Header title="Aufgaben" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Filter Bar */}
        <div className="px-5 pt-4 pb-3 max-w-2xl mx-auto lg:max-w-4xl">
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            <Link
              href={buildHref(undefined, params.assigned)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !params.status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Alle ({statusCounts.all})
            </Link>
            <Link
              href={buildHref('OPEN', params.assigned)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'OPEN'
                  ? 'bg-[var(--status-new)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Offen ({statusCounts.OPEN})
            </Link>
            <Link
              href={buildHref('IN_PROGRESS', params.assigned)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'IN_PROGRESS'
                  ? 'bg-[var(--status-in-progress)] text-[#5a4a00]'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              In Bearbeitung ({statusCounts.IN_PROGRESS})
            </Link>
            <Link
              href={buildHref('DONE', params.assigned)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'DONE'
                  ? 'bg-[var(--status-resolved)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Erledigt ({statusCounts.DONE})
            </Link>
          </div>

          {/* Assignment Filter */}
          <div className="flex gap-1.5 overflow-x-auto pt-1 pb-2 -mx-5 px-5 scrollbar-hide">
            <Link
              href={buildHref(params.status, undefined)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !params.assigned
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Alle ({allCount})
            </Link>
            {personId && (
              <Link
                href={buildHref(params.status, 'me')}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  params.assigned === 'me'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Mir zugewiesen ({myCount})
              </Link>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="space-y-3 stagger-fade-in">
            {tasks.map((task: any) => {
              const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OPEN;
              const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;

              return (
                <Link key={task.id} href={`/aufgaben/${task.id}`} className="block">
                  <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {task.title}
                        </h3>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                      {/* Priority */}
                      <div className={`flex items-center gap-1 text-xs ${
                        task.priority === 'HIGH' ? 'text-[var(--status-escalated)]' : 'text-muted-foreground'
                      }`}>
                        <span>{priority.icon}</span>
                        <span>{priority.label}</span>
                      </div>

                      {/* Assigned to */}
                      {task.assigned_to_person && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-medium"
                            style={{ backgroundColor: task.assigned_to_person.avatar_color || '#4A90D9' }}
                          >
                            {task.assigned_to_person.name?.charAt(0) || '?'}
                          </div>
                          <span className="truncate max-w-[100px]">{task.assigned_to_person.name}</span>
                        </div>
                      )}

                      {/* End date */}
                      {task.end_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>
                            {new Date(task.end_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}

                      {/* Created date (fallback when no end_date) */}
                      {!task.end_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>
                            {new Date(task.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}

            {tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[var(--status-resolved)]/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--status-resolved)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="font-medium text-foreground">Keine Aufgaben</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {params.status ? 'Keine Aufgaben mit diesem Status.' : 'Alles erledigt!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
