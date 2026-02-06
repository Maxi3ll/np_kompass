import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getTensionById } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { TensionActions } from "./tension-actions";

export const revalidate = 30;

const STATUS_CONFIG = {
  NEW: { label: 'Neu', color: 'bg-[var(--status-new)]', textColor: 'text-white', description: 'Diese Spannung wurde noch nicht bearbeitet.' },
  IN_PROGRESS: { label: 'In Bearbeitung', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]', description: 'Jemand kümmert sich darum.' },
  RESOLVED: { label: 'Erledigt', color: 'bg-[var(--status-resolved)]', textColor: 'text-white', description: 'Diese Spannung wurde gelöst.' },
  ESCALATED: { label: 'Eskaliert', color: 'bg-[var(--status-escalated)]', textColor: 'text-white', description: 'Diese Spannung wurde an einen höheren Kreis weitergegeben.' },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Niedrig', color: 'text-muted-foreground', bg: 'bg-muted' },
  MEDIUM: { label: 'Mittel', color: 'text-amber-600', bg: 'bg-amber-100' },
  HIGH: { label: 'Hoch', color: 'text-red-600', bg: 'bg-red-100' },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SpannungDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get person from database
  let personId: string | null = null;
  if (user) {
    const { data: person } = await supabase
      .from("persons")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    personId = person?.id || user.id;
  }

  const tension = await getTensionById(id);

  if (!tension) {
    notFound();
  }

  const status = STATUS_CONFIG[tension.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NEW;
  const priority = PRIORITY_CONFIG[tension.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title="Spannung" showBack backHref="/spannungen" />

      <main className="flex-1 pb-24 page-enter">
        {/* Status Header */}
        <div className={`px-5 py-4 ${status.color}`}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
              <p className={`text-xs ${status.textColor} opacity-80 mt-0.5`}>{status.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto mt-4 space-y-4">
          {/* Title & Description */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
            <h1 className="text-xl font-bold text-foreground">{tension.title}</h1>
            {tension.description && (
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {tension.description}
              </p>
            )}
          </div>

          {/* Circle Info */}
          <Link href={`/kreise/${tension.circle?.id}`}>
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${tension.circle?.color}20` }}
                >
                  {tension.circle?.icon || '⭕'}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Zugeordneter Kreis</p>
                  <p className="font-medium text-foreground">{tension.circle?.name}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Raised By */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
            <p className="text-xs text-muted-foreground mb-2">Gemeldet von</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {tension.raised_by_person?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
              </div>
              <div>
                <p className="font-medium text-foreground">{tension.raised_by_person?.name || 'Unbekannt'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tension.created_at).toLocaleDateString('de-DE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned To (if any) */}
          {tension.assigned_to_person && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-2">Zugewiesen an</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--circle-gebaeude)] flex items-center justify-center text-white text-sm font-medium">
                  {tension.assigned_to_person?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{tension.assigned_to_person?.name}</p>
                  {tension.assigned_to_person?.email && (
                    <p className="text-xs text-muted-foreground">{tension.assigned_to_person?.email}</p>
                  )}
                </div>
                {tension.assigned_to_person?.phone && (
                  <a
                    href={`tel:${tension.assigned_to_person.phone}`}
                    className="w-10 h-10 rounded-full bg-[var(--np-yellow)] flex items-center justify-center"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a4a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Next Action (if any) */}
          {tension.next_action && (
            <div className="bg-[var(--np-yellow-light)] rounded-2xl border border-[var(--np-yellow)]/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--np-yellow)] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a4a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#5a4a00]">Nächster Schritt</p>
                  <p className="text-foreground mt-1">{tension.next_action}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resolution (if resolved) */}
          {tension.status === 'RESOLVED' && tension.resolution && (
            <div className="bg-[var(--status-resolved)]/10 rounded-2xl border border-[var(--status-resolved)]/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--status-resolved)] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--status-resolved)]">Lösung</p>
                  <p className="text-foreground mt-1">{tension.resolution}</p>
                  {tension.resolved_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Gelöst am {new Date(tension.resolved_at).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4">
            <TensionActions
              tensionId={tension.id}
              currentStatus={tension.status}
              currentNextAction={tension.next_action}
              personId={personId || ""}
            />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
