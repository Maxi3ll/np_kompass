import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getDashboardData } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get person from database if user is logged in
  let personId: string | undefined;
  let personData: any = null;

  if (user) {
    const { data: person } = await supabase
      .from("persons")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (person) {
      personId = person.id;
      personData = person;
    }
  }

  const dashboardData = await getDashboardData(personId);
  const { myRoles, openTensions, nextMeeting } = dashboardData;

  // User display info
  const userName = personData?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Benutzer";
  const userEmail = user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title="Kompass" userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} />

      <main className="flex-1 pb-24 page-enter">
        {/* Hero Section with Greeting */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--np-blue-pale)] via-background to-[var(--np-yellow-pale)] opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

          <div className="relative px-5 pt-6 pb-8 max-w-2xl mx-auto">
            <p className="text-muted-foreground text-sm font-medium">Willkommen zurück</p>
            <h2 className="text-2xl font-bold mt-1 text-foreground">
              Ahoi, {userName.split(" ")[0]}!
              <span className="inline-block ml-2 animate-wave">
                ⛵
              </span>
            </h2>
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto space-y-6 -mt-2">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 stagger-fade-in">
            {/* My Roles Card */}
            <Link href="/meine-rollen" className="block">
              <div className="relative overflow-hidden bg-card rounded-2xl p-4 shadow-card card-lift border border-border/50">
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[var(--np-blue)]/5" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--np-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meine Rollen</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{myRoles.length}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {myRoles.slice(0, 2).map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>

            {/* Open Tensions Card */}
            <Link href="/spannungen" className="block">
              <div className="relative overflow-hidden bg-card rounded-2xl p-4 shadow-card card-lift border border-border/50">
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[var(--np-yellow)]/10" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--np-yellow-light)] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--np-yellow-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Offen</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-foreground">{openTensions}</p>
                    <span className="text-sm text-muted-foreground">Spannungen</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">in deinen Kreisen</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Next Meeting Card */}
          <div className="stagger-fade-in">
            <div className="relative overflow-hidden bg-card rounded-2xl shadow-card border border-border/50">
              {/* Colored top border */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ backgroundColor: nextMeeting?.circle?.color || "var(--np-blue)" }}
              />

              <div className="p-5">
                {nextMeeting ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Nächstes Meeting
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {nextMeeting.circle?.name}
                        </h3>
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `color-mix(in srgb, ${nextMeeting.circle?.color || "var(--np-blue)"} 15%, transparent)` }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={nextMeeting.circle?.color || "var(--np-blue)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>
                          {new Date(nextMeeting.date).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}, {new Date(nextMeeting.date).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} Uhr
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/meetings/${nextMeeting.id}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                      Meeting vorbereiten
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">Kein Meeting geplant</p>
                    <p className="text-xs text-muted-foreground mt-1">Meetings werden bald hinzugefügt</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 px-1">
              Schnellzugriff
            </h3>
            <div className="grid grid-cols-4 gap-3 stagger-fade-in">
              {[
                {
                  href: "/spannungen/neu",
                  label: "Spannung",
                  sublabel: "melden",
                  color: "var(--np-yellow)",
                  bgColor: "var(--np-yellow-light)",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  ),
                },
                {
                  href: "/kreise",
                  label: "Kreise",
                  sublabel: "ansehen",
                  color: "var(--np-blue)",
                  bgColor: "var(--np-blue-light)",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  ),
                },
                {
                  href: "/rollen",
                  label: "Rollen",
                  sublabel: "finden",
                  color: "var(--circle-finanzen)",
                  bgColor: "#F3EEFF",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ),
                },
                {
                  href: "/suche",
                  label: "Suche",
                  sublabel: "",
                  color: "var(--circle-gebaeude)",
                  bgColor: "#E6F7F1",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  ),
                },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="block">
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 card-lift">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: action.bgColor }}
                    >
                      <span style={{ color: action.color }}>{action.icon}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground text-center leading-tight">
                      {action.label}
                    </span>
                    {action.sublabel && (
                      <span className="text-[10px] text-muted-foreground">
                        {action.sublabel}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
