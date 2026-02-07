import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getCircleWithRoles } from "@/lib/supabase/queries";
import { isCurrentUserAdmin } from "@/lib/supabase/actions";
import { CircleAdminActions } from "./circle-admin-actions";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KreisDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [circle, isAdmin] = await Promise.all([
    getCircleWithRoles(id),
    isCurrentUserAdmin(),
  ]);

  if (!circle) {
    notFound();
  }

  return (
    <AppShell>
      <Header title={circle.name} showBack backHref="/kreise" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Circle Header */}
        <div
          className="relative px-5 pt-4 pb-6 max-w-2xl mx-auto lg:max-w-4xl"
          style={{ backgroundColor: `${circle.color}10` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${circle.color}20` }}
            >
              {circle.icon || '⭕'}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{circle.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{circle.purpose}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: circle.color }}
              >
                {circle.roles?.length || 0}
              </span>
              <span className="text-muted-foreground">Rollen</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                (circle.openTensions || 0) > 0 ? 'bg-[var(--status-new)]' : 'bg-[var(--status-resolved)]'
              }`}>
                {circle.openTensions || 0}
              </span>
              <span className="text-muted-foreground">Offene Spannungen</span>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <CircleAdminActions
              circle={{ id: circle.id, name: circle.name, purpose: circle.purpose, color: circle.color, icon: circle.icon }}
              hasRoles={(circle.roles?.length || 0) > 0}
            />
          )}
        </div>

        {/* Roles List */}
        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl mt-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 px-1">
            Rollen in diesem Kreis
          </h2>

          <div className="space-y-3 stagger-fade-in">
            {circle.roles?.map((role: any) => (
              <Link key={role.role_id} href={`/rollen/${role.role_id}`} className="block">
                <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{role.role_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {role.role_purpose}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground/50 ml-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>

                  {/* Current Holders */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    {role.holders && role.holders.length > 0 ? (
                      <div className="space-y-2">
                        {role.holders.map((holder: any) => (
                          <div key={holder.id} className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                              style={{ backgroundColor: circle.color }}
                            >
                              {holder.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{holder.name}</p>
                              <p className="text-xs text-muted-foreground">
                                seit {new Date(holder.since).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Vakant - Rolle unbesetzt</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {(!circle.roles || circle.roles.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Keine Rollen in diesem Kreis definiert.</p>
              </div>
            )}
          </div>

          {/* Tensions Link */}
          {(circle.openTensions || 0) > 0 && (
            <Link
              href={`/spannungen?circle=${id}`}
              className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-[var(--np-yellow-light)] border border-[var(--np-yellow)]/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--np-yellow)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a4a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">{circle.openTensions} offene Spannungen</p>
                  <p className="text-xs text-muted-foreground">Alle anzeigen</p>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
        </div>
      </main>

    </AppShell>
  );
}
