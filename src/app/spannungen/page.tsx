import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getTensions, getCircles, getPersonByAuthId } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/actions";
import { TensionsList } from "./tensions-list";

export const revalidate = 30; // Revalidate every 30 seconds

interface PageProps {
  searchParams: Promise<{ status?: string; circle?: string }>;
}

export default async function SpannungenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [allTensions, circles, user] = await Promise.all([
    getTensions(),
    getCircles(),
    getCurrentUser(),
  ]);

  // Get current person ID
  let currentPersonId: string | null = null;
  if (user) {
    const person = await getPersonByAuthId(user.id);
    currentPersonId = person?.id ?? null;
  }

  // All circles including Anker-Kreis, sorted: anchor first
  const anchorCircle = circles.find((c: any) => c.parent_circle_id === null);
  const displayCircles = [
    ...(anchorCircle ? [anchorCircle] : []),
    ...circles.filter((c: any) => c.parent_circle_id !== null),
  ];

  // Apply circle filter
  const circleFiltered = params.circle
    ? allTensions.filter((t: any) => t.circle_id === params.circle)
    : allTensions;

  // Status counts from circle-filtered tensions
  const statusCounts = {
    all: circleFiltered.filter((t: any) => t.status !== 'RESOLVED').length,
    NEW: circleFiltered.filter((t: any) => t.status === 'NEW').length,
    IN_PROGRESS: circleFiltered.filter((t: any) => t.status === 'IN_PROGRESS').length,
    RESOLVED: circleFiltered.filter((t: any) => t.status === 'RESOLVED').length,
  };

  // Circle counts from status-filtered tensions (so counts reflect active status filter)
  const isArchive = params.status === 'RESOLVED';
  const statusFiltered = params.status
    ? allTensions.filter((t: any) => t.status === params.status)
    : allTensions.filter((t: any) => t.status !== 'RESOLVED');
  const circleCounts: Record<string, number> = {};
  statusFiltered.forEach((t: any) => {
    if (t.circle_id) circleCounts[t.circle_id] = (circleCounts[t.circle_id] || 0) + 1;
  });

  // Apply both filters for display
  // "Alle" (no status param) excludes RESOLVED; archive shows only RESOLVED
  const tensions = params.status
    ? circleFiltered.filter((t: any) => t.status === params.status)
    : circleFiltered.filter((t: any) => t.status !== 'RESOLVED');

  // Build hrefs that preserve the other filter
  const buildHref = (status?: string, circleId?: string) => {
    const parts = [
      status && `status=${status}`,
      circleId && `circle=${circleId}`,
    ].filter(Boolean);
    return `/spannungen${parts.length ? `?${parts.join('&')}` : ''}`;
  };

  return (
    <AppShell>
      <Header title="Spannungen" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Filter Bar */}
        <div className="px-5 pt-4 pb-3 max-w-2xl mx-auto lg:max-w-4xl">
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            <Link
              href={buildHref(undefined, params.circle)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !params.status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Alle ({statusCounts.all})
            </Link>
            <Link
              href={buildHref('NEW', params.circle)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'NEW'
                  ? 'bg-[var(--status-new)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Neu ({statusCounts.NEW})
            </Link>
            <Link
              href={buildHref('IN_PROGRESS', params.circle)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                params.status === 'IN_PROGRESS'
                  ? 'bg-[var(--status-in-progress)] text-[#5a4a00]'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              In Bearbeitung ({statusCounts.IN_PROGRESS})
            </Link>
            <Link
              href={buildHref('RESOLVED', params.circle)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                params.status === 'RESOLVED'
                  ? 'bg-[var(--status-resolved)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21 8-2-2H5L3 8" />
                <rect x="3" y="8" width="18" height="12" rx="1" />
                <path d="M10 12h4" />
              </svg>
              Archiv ({statusCounts.RESOLVED})
            </Link>
          </div>

          {/* Circle Filter - Color-dot chips */}
          <div className="flex gap-1.5 overflow-x-auto pt-1 pb-2 -mx-5 px-5 scrollbar-hide">
            <Link
              href={buildHref(params.status, undefined)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !params.circle
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-foreground/40 flex-shrink-0" />
              Alle Kreise ({statusFiltered.length})
            </Link>
            {displayCircles.map((circle: any) => {
              const count = circleCounts[circle.id] || 0;
              if (count === 0) return null;
              const isActive = params.circle === circle.id;
              return (
                <Link
                  key={circle.id}
                  href={buildHref(params.status, circle.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  style={isActive ? { backgroundColor: `${circle.color}18` } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: circle.color || '#4A90D9' }}
                  />
                  {circle.name} ({count})
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tensions List */}
        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
          <TensionsList
            tensions={tensions}
            currentPersonId={currentPersonId}
            isArchive={isArchive}
            statusFilter={params.status}
          />
        </div>

      </main>

    </AppShell>
  );
}
