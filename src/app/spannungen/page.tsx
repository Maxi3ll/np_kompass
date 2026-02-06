import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getTensions, getCircles } from "@/lib/supabase/queries";

export const revalidate = 30; // Revalidate every 30 seconds

const STATUS_CONFIG = {
  NEW: { label: 'Neu', color: 'bg-[var(--status-new)]', textColor: 'text-white' },
  IN_PROGRESS: { label: 'In Bearbeitung', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]' },
  RESOLVED: { label: 'Erledigt', color: 'bg-[var(--status-resolved)]', textColor: 'text-white' },
  ESCALATED: { label: 'Eskaliert', color: 'bg-[var(--status-escalated)]', textColor: 'text-white' },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Niedrig', icon: '○' },
  MEDIUM: { label: 'Mittel', icon: '◐' },
  HIGH: { label: 'Hoch', icon: '●' },
};

interface PageProps {
  searchParams: Promise<{ status?: string; circle?: string }>;
}

export default async function SpannungenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [tensions, circles] = await Promise.all([
    getTensions({
      status: params.status,
      circleId: params.circle,
    }),
    getCircles(),
  ]);

  // Filter out Anker-Kreis
  const displayCircles = circles.filter((c: any) => c.parent_circle_id !== null);

  // Count by status
  const statusCounts = {
    all: tensions.length,
    NEW: tensions.filter((t: any) => t.status === 'NEW').length,
    IN_PROGRESS: tensions.filter((t: any) => t.status === 'IN_PROGRESS').length,
    RESOLVED: tensions.filter((t: any) => t.status === 'RESOLVED').length,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title="Spannungen" showBack backHref="/" />

      <main className="flex-1 pb-24 page-enter">
        {/* Filter Bar */}
        <div className="px-5 pt-4 pb-3 max-w-2xl mx-auto">
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            <Link
              href="/spannungen"
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !params.status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Alle ({statusCounts.all})
            </Link>
            <Link
              href="/spannungen?status=NEW"
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'NEW'
                  ? 'bg-[var(--status-new)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Neu ({statusCounts.NEW})
            </Link>
            <Link
              href="/spannungen?status=IN_PROGRESS"
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'IN_PROGRESS'
                  ? 'bg-[var(--status-in-progress)] text-[#5a4a00]'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              In Bearbeitung ({statusCounts.IN_PROGRESS})
            </Link>
            <Link
              href="/spannungen?status=RESOLVED"
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'RESOLVED'
                  ? 'bg-[var(--status-resolved)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Erledigt ({statusCounts.RESOLVED})
            </Link>
          </div>

          {/* Circle Filter */}
          {params.circle && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Gefiltert nach:</span>
              <Link
                href={params.status ? `/spannungen?status=${params.status}` : '/spannungen'}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs font-medium"
              >
                {displayCircles.find((c: any) => c.id === params.circle)?.name || 'Kreis'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Tensions List */}
        <div className="px-5 max-w-2xl mx-auto">
          <div className="space-y-3 stagger-fade-in">
            {tensions.map((tension: any) => {
              const status = STATUS_CONFIG[tension.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NEW;
              const priority = PRIORITY_CONFIG[tension.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;

              return (
                <Link key={tension.id} href={`/spannungen/${tension.id}`} className="block">
                  <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {tension.title}
                        </h3>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Description */}
                    {tension.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {tension.description}
                      </p>
                    )}

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                      {/* Circle */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tension.circle?.color || '#4A90D9' }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {tension.circle?.name}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className={`flex items-center gap-1 text-xs ${
                        tension.priority === 'HIGH' ? 'text-[var(--status-escalated)]' : 'text-muted-foreground'
                      }`}>
                        <span>{priority.icon}</span>
                        <span>{priority.label}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>
                          {new Date(tension.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {tensions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[var(--status-resolved)]/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--status-resolved)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="font-medium text-foreground">Keine Spannungen</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {params.status ? 'Keine Spannungen mit diesem Status.' : 'Alles erledigt!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAB for new tension */}
        <Link
          href="/spannungen/neu"
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[var(--np-yellow)] shadow-lg flex items-center justify-center transition-all hover:shadow-xl hover:scale-105 active:scale-95"
          style={{ boxShadow: '0 4px 20px rgba(245, 200, 66, 0.4)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5a4a00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
