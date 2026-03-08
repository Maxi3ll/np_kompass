import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboardData } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { RightPanel } from "@/components/dashboard/right-panel";
import { Users, CircleDot, Zap, User, Rocket, Calendar, Clock, FilePlus } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
  const { myRoles, openTensions, myCircleIds, myCircleTensions, assignedTensions, nextMeeting, activeProjekteCount, myVolunteerCount, myProjektName } = dashboardData;

  // User display info
  const userName = personData?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Benutzer";
  return (
    <AppShell>
      <Header title="Kompass" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Hero Section with Greeting */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--np-blue-pale)] via-background to-[var(--np-yellow-pale)] opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

          <div className="relative px-5 pt-6 pb-8 max-w-2xl mx-auto lg:max-w-4xl xl:max-w-6xl">
            <p className="text-muted-foreground text-sm font-medium">Willkommen zurück</p>
            <h2 className="text-2xl font-bold mt-1 text-foreground">
              Ahoi, {userName.split(" ")[0]}!
              <span className="inline-block ml-2 animate-wave">
                ⛵
              </span>
            </h2>
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl xl:max-w-6xl xl:grid xl:grid-cols-[1fr_288px] xl:gap-6 -mt-2">
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 stagger-fade-in">
            {/* My Roles Card */}
            <Link href="/profil" className="block h-full">
              <div className="relative overflow-hidden bg-card rounded-2xl p-4 shadow-card card-lift border border-border/50 h-full">
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[var(--np-blue)]/5" />
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
                      <Users size={14} color="var(--np-blue)" strokeWidth={2.5} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{myRoles.length}</p>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Rollen</span>
                  {myCircleIds.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <CircleDot size={10} color="var(--np-blue)" strokeWidth={2.5} />
                      <span className="text-[10px] font-medium text-[var(--np-blue)]">{myCircleIds.length} {myCircleIds.length === 1 ? 'Kreis' : 'Kreise'}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Open Tensions Card */}
            <Link href="/spannungen" className="block h-full">
              <div className="relative overflow-hidden bg-card rounded-2xl p-4 shadow-card card-lift border border-border/50 h-full">
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[var(--np-yellow)]/10" />
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--np-yellow-light)] flex items-center justify-center">
                      <Zap size={14} color="var(--np-yellow-dark)" strokeWidth={2.5} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{myCircleTensions}</p>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Spannungen</span>
                  {assignedTensions > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <User size={10} color="var(--np-yellow-dark)" strokeWidth={2.5} />
                      <span className="text-[10px] font-medium text-[var(--np-yellow-dark)]">{assignedTensions} an dich</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* My Projekte Card */}
            <Link href="/projekte" className="block h-full">
              <div className="relative overflow-hidden bg-card rounded-2xl p-4 shadow-card card-lift border border-border/50 h-full">
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[var(--status-resolved)]/10" />
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--status-resolved)]/15 flex items-center justify-center">
                      <Rocket size={14} color="var(--status-resolved)" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{activeProjekteCount}</p>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Projekte</span>
                  {myProjektName ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Rocket size={10} color="var(--status-resolved)" strokeWidth={2.5} />
                      <span className="text-[10px] font-medium text-[var(--status-resolved)] truncate max-w-[80px]">{myProjektName}</span>
                    </div>
                  ) : myVolunteerCount > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Users size={10} color="var(--status-resolved)" strokeWidth={2.5} />
                      <span className="text-[10px] font-medium text-[var(--status-resolved)]">{myVolunteerCount} dabei</span>
                    </div>
                  )}
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
                            Nächster Termin
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {nextMeeting.circle?.name}
                        </h3>
                      </div>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `color-mix(in srgb, ${nextMeeting.circle?.color || "var(--np-blue)"} 15%, transparent)` }}
                      >
                        <Calendar size={20} color={nextMeeting.circle?.color || "var(--np-blue)"} />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={16} />
                        <span>
                          {new Date(nextMeeting.date).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            timeZone: "Europe/Berlin",
                          })}, {new Date(nextMeeting.date).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Europe/Berlin",
                          })} Uhr
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/meetings/${nextMeeting.id}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
                    >
                      <FilePlus size={18} />
                      Termin vorbereiten
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                      <Calendar size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Kein Termin in einem deiner Kreise geplant</p>
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
            <div className="grid grid-cols-3 gap-3 stagger-fade-in">
              {[
                {
                  href: "/spannungen/neu",
                  label: "Spannung",
                  sublabel: "melden",
                  color: "var(--np-yellow)",
                  bgColor: "var(--np-yellow-light)",
                  icon: (
                    <Zap size={22} />
                  ),
                },
                {
                  href: "/kreise",
                  label: "Kreise",
                  sublabel: "ansehen",
                  color: "var(--np-blue)",
                  bgColor: "var(--np-blue-light)",
                  icon: (
                    <CircleDot size={22} />
                  ),
                },
                {
                  href: "/rollen",
                  label: "Rollen",
                  sublabel: "finden",
                  color: "var(--circle-finanzen)",
                  bgColor: "#F3EEFF",
                  icon: (
                    <Users size={22} />
                  ),
                },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="block">
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 card-lift">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center mb-2"
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

        <RightPanel
          myRoles={myRoles}
        />
        </div>
      </main>

    </AppShell>
  );
}
