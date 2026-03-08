import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Phone, SquareCheck, CircleCheck } from "lucide-react";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getTensionById, getCircles, getTensionComments, getActivePersons } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/supabase/actions";
import { TensionActions } from "./tension-actions";
import { TensionComments } from "./tension-comments";

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
    personId = person?.id ?? null;
  }

  const [tension, circles, comments, persons, admin] = await Promise.all([
    getTensionById(id),
    getCircles(),
    getTensionComments(id),
    getActivePersons(),
    isCurrentUserAdmin(),
  ]);

  if (!tension) {
    notFound();
  }

  const status = STATUS_CONFIG[tension.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NEW;
  const priority = PRIORITY_CONFIG[tension.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;

  return (
    <AppShell>
      <Header title="Spannung" showBack backHref="/spannungen" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Status Header */}
        <div className={`px-5 py-4 ${status.color}`}>
          <div className="max-w-2xl mx-auto lg:max-w-4xl flex items-center justify-between">
            <div>
              <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
              <p className={`text-xs ${status.textColor} opacity-80 mt-0.5`}>{status.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl mt-4 space-y-4">
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
                <ChevronRight size={20} className="text-muted-foreground" />
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
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: tension.assigned_to_person?.avatar_color || '#4A90D9' }}
                >
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
                    <Phone size={18} color="#5a4a00" />
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
                  <SquareCheck size={16} color="#5a4a00" />
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
                  <CircleCheck size={16} color="white" />
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
              personId={personId ?? ""}
              raisedBy={tension.raised_by_person?.id ?? ""}
              circles={(circles || []).filter((c: any) => c.parent_circle_id !== null)}
              currentTitle={tension.title}
              currentDescription={tension.description || ""}
              currentCircleId={tension.circle?.id || ""}
              currentPriority={tension.priority}
              currentAssignedTo={tension.assigned_to || null}
              isAdmin={admin}
              persons={persons || []}
            />
          </div>

          {/* Comments */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
            <TensionComments
              tensionId={tension.id}
              personId={personId ?? ""}
              initialComments={comments}
            />
          </div>
        </div>
      </main>

    </AppShell>
  );
}
