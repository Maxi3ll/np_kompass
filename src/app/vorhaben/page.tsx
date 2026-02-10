import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getVorhaben } from "@/lib/supabase/queries";

export const revalidate = 30;

const STATUS_CONFIG = {
  OPEN: { label: 'Offen', color: 'bg-[var(--status-new)]', textColor: 'text-white' },
  IN_PROGRESS: { label: 'In Umsetzung', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]' },
  DONE: { label: 'Abgeschlossen', color: 'bg-[var(--status-resolved)]', textColor: 'text-white' },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function VorhabenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const allVorhaben = await getVorhaben();

  // Status counts
  const statusCounts = {
    all: allVorhaben.length,
    OPEN: allVorhaben.filter((v: any) => v.status === 'OPEN').length,
    IN_PROGRESS: allVorhaben.filter((v: any) => v.status === 'IN_PROGRESS').length,
    DONE: allVorhaben.filter((v: any) => v.status === 'DONE').length,
  };

  const vorhaben = params.status
    ? allVorhaben.filter((v: any) => v.status === params.status)
    : allVorhaben;

  const buildHref = (status?: string) => {
    return `/vorhaben${status ? `?status=${status}` : ''}`;
  };

  return (
    <AppShell>
      <Header title="Vorhaben" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Filter Bar */}
        <div className="px-5 pt-4 pb-3 max-w-2xl mx-auto lg:max-w-4xl">
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

        {/* Vorhaben List */}
        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="space-y-3 stagger-fade-in">
            {vorhaben.map((v: any) => {
              const status = STATUS_CONFIG[v.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OPEN;
              const subtaskProgress = v.subtask_count > 0
                ? `${v.subtask_done_count}/${v.subtask_count}`
                : null;

              return (
                <Link key={v.id} href={`/vorhaben/${v.id}`} className="block">
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
                        {v.circles.map((circle: any) => (
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 11 12 14 22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                          <span>{subtaskProgress}</span>
                        </div>
                      )}

                      {/* Date Range */}
                      {(v.start_date || v.end_date) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
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

            {vorhaben.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>
                </div>
                <p className="font-medium text-foreground">Keine Vorhaben</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {params.status ? 'Keine Vorhaben mit diesem Status.' : 'Noch keine Vorhaben erstellt.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
