import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getAllRoles, getCircles } from "@/lib/supabase/queries";
import { KreiseRollenTabs } from "@/components/navigation/kreise-rollen-tabs";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ circle?: string }>;
}

export default async function RollenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [roles, circles] = await Promise.all([getAllRoles(), getCircles()]);

  // Filter out Anker-Kreis
  const displayCircles = circles.filter((c: any) => c.parent_circle_id !== null);

  // Filter by circle if param set
  const filteredRoles = params.circle
    ? roles.filter((r: any) => r.circle?.id === params.circle)
    : roles;

  // Group roles by circle
  const groupedRoles = filteredRoles.reduce((groups: Record<string, any[]>, role: any) => {
    const circleId = role.circle?.id || "unknown";
    if (!groups[circleId]) groups[circleId] = [];
    groups[circleId].push(role);
    return groups;
  }, {});

  // Sort circle groups by circle name
  const sortedGroups = Object.entries(groupedRoles).sort(([, a], [, b]) => {
    const nameA = (a as any[])[0]?.circle?.name || "";
    const nameB = (b as any[])[0]?.circle?.name || "";
    return nameA.localeCompare(nameB, "de");
  });

  return (
    <AppShell>
      <Header title="Rollen" showBack backHref="/kreise" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter overflow-x-hidden">
        <KreiseRollenTabs />

        {/* Circle Filter */}
        <div className="px-5 pt-2 pb-3 max-w-2xl mx-auto lg:max-w-4xl lg:pt-4 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            <Link
              href="/rollen"
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !params.circle
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Alle ({roles.length})
            </Link>
            {displayCircles.map((circle: any) => {
              const count = roles.filter((r: any) => r.circle?.id === circle.id).length;
              if (count === 0) return null;
              return (
                <Link
                  key={circle.id}
                  href={`/rollen?circle=${circle.id}`}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    params.circle === circle.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {circle.icon} {circle.name} ({count})
                </Link>
              );
            })}
          </div>
        </div>

        {/* Roles List */}
        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
          {sortedGroups.length > 0 ? (
            <div className="space-y-6 stagger-fade-in">
              {sortedGroups.map(([circleId, circleRoles]) => {
                const circle = (circleRoles as any[])[0]?.circle;
                return (
                  <div key={circleId}>
                    {!params.circle && (
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: circle?.color || "#4A90D9" }}
                        />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {circle?.name}
                        </h3>
                      </div>
                    )}
                    <div className="space-y-3">
                      {(circleRoles as any[]).map((role: any) => (
                        <Link key={role.id} href={`/rollen/${role.id}`} className="block">
                          <div className="relative overflow-hidden bg-card rounded-2xl shadow-card border border-border/50 transition-all card-lift active:scale-[0.98]">
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                              style={{ backgroundColor: role.circle?.color || "#4A90D9" }}
                            />
                            <div className="flex items-center gap-4 p-4 pl-5">
                              {/* Icon */}
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                                style={{ backgroundColor: `${role.circle?.color}20` }}
                              >
                                {role.circle?.icon || "⭕"}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground">
                                  {role.name}
                                </h3>
                                {role.purpose && (
                                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                    {role.purpose}
                                  </p>
                                )}
                              </div>

                              {/* Holder or Vacant */}
                              <div className="flex-shrink-0 text-right">
                                {role.holder ? (
                                  <span className="text-sm text-foreground">
                                    {role.holder.name?.split(" ")[0]}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">
                                    Vakant
                                  </span>
                                )}
                              </div>

                              {/* Arrow */}
                              <div className="flex-shrink-0 text-muted-foreground/50">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="font-medium text-foreground">Keine Rollen gefunden</p>
            </div>
          )}
        </div>
      </main>

    </AppShell>
  );
}
