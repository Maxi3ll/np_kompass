import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getRoleById, getRoleHistory } from "@/lib/supabase/queries";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RollenDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [role, history] = await Promise.all([
    getRoleById(id),
    getRoleHistory(id),
  ]);

  if (!role) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title={role.circle_name || "Rolle"} showBack backHref={`/kreise/${role.circle_id}`} />

      <main className="flex-1 pb-24 page-enter">
        {/* Role Header */}
        <div className="px-5 pt-4 pb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Rolle
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{role.role_name}</h1>
        </div>

        <div className="px-5 max-w-2xl mx-auto space-y-6">
          {/* Current Holder Card */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            {role.holder_name ? (
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--np-blue)] to-[var(--np-blue-dark)] flex items-center justify-center text-white text-lg font-semibold">
                    {role.holder_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">{role.holder_name}</p>
                    <p className="text-sm text-muted-foreground">
                      seit {new Date(role.holder_since).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="flex gap-2 mt-4">
                  {role.holder_email && (
                    <a
                      href={`mailto:${role.holder_email}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      E-Mail
                    </a>
                  )}
                  {role.holder_phone && (
                    <a
                      href={`tel:${role.holder_phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--np-yellow)] text-[#5a4a00] font-medium text-sm transition-all hover:bg-[var(--np-yellow-dark)] active:scale-[0.98]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Anrufen
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-700">Rolle vakant</p>
                    <p className="text-sm text-muted-foreground">Diese Rolle ist aktuell nicht besetzt</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Purpose */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--np-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h2 className="font-semibold text-foreground">Zweck</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {role.role_purpose || "Kein Zweck definiert."}
            </p>
          </div>

          {/* Domains */}
          {role.domains && role.domains.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--circle-finanzen)]/15 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--circle-finanzen)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-foreground">Domains</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Bereiche, über die diese Rolle eigenständig entscheiden darf
              </p>
              <ul className="space-y-2">
                {role.domains.map((domain: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--circle-finanzen)] mt-2 flex-shrink-0" />
                    <span className="text-foreground">{domain}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Accountabilities */}
          {role.accountabilities && role.accountabilities.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--circle-gebaeude)]/15 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--circle-gebaeude)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="font-semibold text-foreground">Aufgaben</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Wiederkehrende Tätigkeiten, für die diese Rolle verantwortlich ist
              </p>
              <ul className="space-y-2">
                {role.accountabilities.map((acc: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--circle-gebaeude)] mt-2 flex-shrink-0" />
                    <span className="text-foreground">{acc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Role History */}
          {history && history.length > 1 && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h2 className="font-semibold text-foreground">Rollenhistorie</h2>
              </div>
              <div className="space-y-3">
                {history.map((entry: any, index: number) => (
                  <div key={entry.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {entry.person?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${index === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {entry.person?.name || 'Unbekannt'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.valid_from).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                        {entry.valid_until && ` – ${new Date(entry.valid_until).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}`}
                        {!entry.valid_until && index === 0 && ' – heute'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back to Circle */}
          <Link
            href={`/kreise/${role.circle_id}`}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border text-foreground font-medium text-sm transition-all hover:bg-accent active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Zurück zu {role.circle_name}
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
