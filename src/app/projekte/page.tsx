import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getProjekte } from "@/lib/supabase/queries";
import { Plus, SquareCheckBig, Calendar, Clock, Rocket } from "lucide-react";
import type { ProjektWithDetails } from "@/types";

export const revalidate = 30;

const STATUS_CONFIG = {
  OPEN: { label: 'Offen', color: 'bg-[var(--status-new)]', textColor: 'text-white' },
  IN_PROGRESS: { label: 'In Umsetzung', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]' },
  DONE: { label: 'Abgeschlossen', color: 'bg-[var(--status-resolved)]', textColor: 'text-white' },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ProjektePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const allProjekte = await getProjekte() as ProjektWithDetails[];

  // Status counts
  const statusCounts = {
    all: allProjekte.length,
    OPEN: allProjekte.filter((v) => v.status === 'OPEN').length,
    IN_PROGRESS: allProjekte.filter((v) => v.status === 'IN_PROGRESS').length,
    DONE: allProjekte.filter((v) => v.status === 'DONE').length,
  };

  const projekte = params.status
    ? allProjekte.filter((v) => v.status === params.status)
    : allProjekte;

  const buildHref = (status?: string) => {
    return `/projekte${status ? `?status=${status}` : ''}`;
  };

  return (
    <AppShell>
      <Header title="Projekte" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Hero Section */}
        <div className="px-5 pt-6 pb-6 max-w-2xl mx-auto lg:max-w-4xl">
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-foreground">
            Projekte
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Projekte sind zeitlich begrenzte Themen, die mehrere Aufgaben betreffen und gemeinsam umgesetzt werden.
          </p>
          <Link
            href="/projekte/neu"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            Neues Projekt
          </Link>
        </div>

        {/* Divider */}
        <div className="max-w-2xl mx-auto lg:max-w-4xl px-5">
          <hr className="border-border" />
        </div>

        {/* Filter Bar */}
        <div className="px-5 pt-5 pb-3 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            <Link
              href={buildHref(undefined)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !params.status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Alle ({statusCounts.all})
            </Link>
            <Link
              href={buildHref('OPEN')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'OPEN'
                  ? 'bg-[var(--status-new)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Offen ({statusCounts.OPEN})
            </Link>
            <Link
              href={buildHref('IN_PROGRESS')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'IN_PROGRESS'
                  ? 'bg-[var(--status-in-progress)] text-[#5a4a00]'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              In Umsetzung ({statusCounts.IN_PROGRESS})
            </Link>
            <Link
              href={buildHref('DONE')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'DONE'
                  ? 'bg-[var(--status-resolved)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Abgeschlossen ({statusCounts.DONE})
            </Link>
          </div>
        </div>

        {/* Projekte List */}
        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="space-y-3 stagger-fade-in">
            {projekte.map((v) => {
              const status = STATUS_CONFIG[v.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OPEN;
              const subtaskProgress = (v.subtask_count ?? 0) > 0
                ? `${v.subtask_done_count}/${v.subtask_count}`
                : null;

              return (
                <Link key={v.id} href={`/projekte/${v.id}`} className="block">
                  <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {v.title}
                        </h3>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Short Description */}
                    {v.short_description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {v.short_description}
                      </p>
                    )}

                    {/* Circle Badges */}
                    {v.circles && v.circles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {v.circles.map((circle) => (
                          <span
                            key={circle.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              backgroundColor: `${circle.color || '#4A90D9'}15`,
                              color: circle.color || '#4A90D9',
                            }}
                          >
                            {circle.icon} {circle.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                      {/* Coordinator */}
                      {v.coordinator && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-medium"
                            style={{ backgroundColor: v.coordinator.avatar_color || '#4A90D9' }}
                          >
                            {v.coordinator.name?.charAt(0) || '?'}
                          </div>
                          <span className="truncate max-w-[100px]">{v.coordinator.name}</span>
                        </div>
                      )}

                      {/* Subtask Progress */}
                      {subtaskProgress && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <SquareCheckBig size={12} />
                          <span>{subtaskProgress}</span>
                        </div>
                      )}

                      {/* Date Range */}
                      {(v.start_date || v.end_date) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <Calendar size={12} />
                          <span>
                            {v.start_date && new Date(v.start_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                            {v.start_date && v.end_date && ' – '}
                            {v.end_date && new Date(v.end_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}

                      {/* Created date (fallback when no dates) */}
                      {!v.start_date && !v.end_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <Clock size={12} />
                          <span>
                            {new Date(v.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}

            {projekte.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Rocket size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <p className="font-medium text-foreground">Keine Projekte</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {params.status ? 'Keine Projekte mit diesem Status.' : 'Noch keine Projekte erstellt.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
