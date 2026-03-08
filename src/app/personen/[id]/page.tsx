import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getPersonWithRoles } from "@/lib/supabase/queries";
import { Mail, Phone, Users, ChevronRight } from "lucide-react";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    month: "short",
    year: "numeric",
  });
}

export default async function PersonenDetailPage({ params }: PageProps) {
  const { id } = await params;
  const person = await getPersonWithRoles(id);

  if (!person) {
    notFound();
  }

  const avatarColor = person.avatar_color || "#4A90D9";

  return (
    <AppShell>
      <Header title="Profil" showBack />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl space-y-6">
          {/* Person Header */}
          <div className="flex items-center gap-4 pt-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(person.name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">
                {person.name}
              </h1>
              {person.family && (
                <p className="text-sm text-muted-foreground">
                  Familie {person.family.name}
                </p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
                <Mail size={16} color="var(--np-blue)" />
              </div>
              <h2 className="font-semibold text-foreground">Kontakt</h2>
            </div>
            <div className="space-y-2">
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="flex items-center gap-3 text-sm text-primary hover:underline"
                >
                  <Mail size={16} className="text-muted-foreground flex-shrink-0" />
                  {person.email}
                </a>
              )}
              {person.phone && (
                <a
                  href={`tel:${person.phone}`}
                  className="flex items-center gap-3 text-sm text-primary hover:underline"
                >
                  <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                  {person.phone}
                </a>
              )}
            </div>
          </div>

          {/* Current Roles */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
                <Users size={16} color="var(--np-blue)" />
              </div>
              <h2 className="font-semibold text-foreground">
                Aktuelle Rollen
              </h2>
            </div>

            {person.roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine aktiven Rollen
              </p>
            ) : (
              <div className="space-y-2">
                {person.roles.map((role: any) => (
                  <Link
                    key={role.id}
                    href={`/rollen/${role.id}`}
                    className="flex items-center gap-3 p-3 -mx-1 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${role.circle?.color || "#4A90D9"}20` }}
                    >
                      {role.circle?.icon || "⭕"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {role.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {role.circle?.name}
                        </span>
                        {role.since && (
                          <>
                            <span className="text-xs text-muted-foreground/50">·</span>
                            <span className="text-xs text-muted-foreground">
                              seit {formatDate(role.since)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/50 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
