import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getSubtaskById, getSubtaskComments } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { getPersonsList } from "@/lib/supabase/actions";
import { SubtaskActions } from "./subtask-actions";
import { SubtaskComments } from "./subtask-comments";
import { VolunteerSection } from "./volunteer-section";

export const revalidate = 30;

const STATUS_CONFIG = {
  OPEN: { label: 'Offen', color: 'bg-[var(--status-new)]', textColor: 'text-white', description: 'Diese Unteraufgabe wurde noch nicht begonnen.' },
  IN_PROGRESS: { label: 'In Arbeit', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]', description: 'An dieser Unteraufgabe wird gearbeitet.' },
  DONE: { label: 'Erledigt', color: 'bg-[var(--status-resolved)]', textColor: 'text-white', description: 'Diese Unteraufgabe wurde abgeschlossen.' },
};

interface PageProps {
  params: Promise<{ id: string; subId: string }>;
}

export default async function SubtaskDetailPage({ params }: PageProps) {
  const { id, subId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let personId: string | null = null;
  if (user) {
    const { data: person } = await supabase
      .from("persons")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    personId = person?.id || null;
  }

  const [subtask, comments, personsResult] = await Promise.all([
    getSubtaskById(subId),
    getSubtaskComments(subId),
    getPersonsList(),
  ]);

  const persons = personsResult.persons || [];

  if (!subtask) {
    notFound();
  }

  const status = STATUS_CONFIG[subtask.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OPEN;

  // Check if current user is already a volunteer
  const isVolunteer = personId
    ? (subtask.volunteers || []).some((v: any) => v.id === personId)
    : false;

  return (
    <AppShell>
      <Header title="Unteraufgabe" showBack backHref={`/vorhaben/${id}`} />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Status Header */}
        <div className={`px-5 py-4 ${status.color}`}>
          <div className="max-w-2xl mx-auto lg:max-w-4xl flex items-center justify-between">
            <div>
              <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
              <p className={`text-xs ${status.textColor} opacity-80 mt-0.5`}>{status.description}</p>
            </div>
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl mt-4 space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href={`/vorhaben/${id}`} className="hover:text-foreground transition-colors">
              {(subtask.vorhaben as any)?.title || 'Vorhaben'}
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-foreground font-medium">Unteraufgabe</span>
          </div>

          {/* Title & Description */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
            <h1 className="text-xl font-bold text-foreground">{subtask.title}</h1>
            {subtask.description && (
              <p className="text-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap">
                {subtask.description}
              </p>
            )}
          </div>

          {/* Contact Person */}
          {subtask.contact_person && (
            <Link href={`/personen/${subtask.contact_person.id}`}>
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4 transition-all card-lift active:scale-[0.98]">
                <p className="text-xs text-muted-foreground mb-2">Ansprechperson</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: subtask.contact_person.avatar_color || '#4A90D9' }}
                  >
                    {subtask.contact_person.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{subtask.contact_person.name}</p>
                    {subtask.contact_person.email && (
                      <p className="text-xs text-muted-foreground">{subtask.contact_person.email}</p>
                    )}
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </Link>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <SubtaskActions
              subtaskId={subId}
              currentStatus={subtask.status}
              personId={personId || ""}
              createdBy={subtask.created_by || ""}
              persons={persons}
              currentTitle={subtask.title}
              currentDescription={subtask.description || ""}
              currentContactPersonId={subtask.contact_person?.id || ""}
            />
          </div>

          {/* Volunteers */}
          <div className="pt-2">
            <VolunteerSection
              subtaskId={subId}
              personId={personId || ""}
              volunteers={subtask.volunteers || []}
              isVolunteer={isVolunteer}
            />
          </div>

          {/* Comments */}
          <div className="pt-2">
            <SubtaskComments
              subtaskId={subId}
              personId={personId || ""}
              initialComments={comments}
            />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
