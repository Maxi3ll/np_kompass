import { redirect } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getPersonWithRoles } from "@/lib/supabase/queries";
import { isCurrentUserAdmin, getAllowedEmails } from "@/lib/supabase/actions";
import { LogoutButton } from "./logout-button";
import { AdminEmails } from "./admin-emails";
import { ProfileEditDialog } from "./profile-edit-dialog";
import Link from "next/link";

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Try to get person data from database
  let { data: person } = await supabase
    .from("persons")
    .select("*, family:families(*)")
    .eq("auth_user_id", user.id)
    .single();

  // Auto-link: if no person found by auth_user_id, try matching by email
  if (!person && user.email) {
    const serviceClient = createServiceClient();
    const { data: unlinkedPerson } = await serviceClient
      .from("persons")
      .select("id, auth_user_id")
      .eq("email", user.email)
      .single();

    if (unlinkedPerson && !unlinkedPerson.auth_user_id) {
      await serviceClient
        .from("persons")
        .update({ auth_user_id: user.id })
        .eq("id", unlinkedPerson.id);

      // Re-fetch with full data now that it's linked
      const { data: linkedPerson } = await supabase
        .from("persons")
        .select("*, family:families(*)")
        .eq("auth_user_id", user.id)
        .single();
      person = linkedPerson;
    }
  }

  // Get roles if person exists
  let personWithRoles = null;
  if (person) {
    personWithRoles = await getPersonWithRoles(person.id);
  }

  const displayName = person?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Benutzer";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  // Check admin status and load allowlist
  const isAdmin = await isCurrentUserAdmin();
  let allowedEmails: { id: string; email: string; added_by: string | null; created_at: string }[] = [];
  let adminEmail: string | null = null;
  if (isAdmin) {
    const result = await getAllowedEmails();
    if (!result.error && result.emails) {
      allowedEmails = result.emails;
      adminEmail = result.adminEmail ?? null;
    }
  }

  return (
    <AppShell>
      <Header title="Profil" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        {/* Profile Header */}
        <div className="px-5 py-8 max-w-2xl mx-auto lg:max-w-4xl text-center">
          <div className="relative inline-block mx-auto mb-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: person?.avatar_color || "#4A90D9" }}
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            {person && (
              <ProfileEditDialog
                personId={person.id}
                currentName={person.name}
                currentAvatarColor={person.avatar_color}
              />
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          {person?.family && (
            <p className="text-sm text-muted-foreground mt-1">
              {person.family.name}
            </p>
          )}
        </div>

        <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl space-y-4">
          {/* Roles */}
          {personWithRoles?.roles && personWithRoles.roles.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Meine Rollen ({personWithRoles.roles.length})
              </h2>
              <div className="space-y-2">
                {personWithRoles.roles.map((role: any) => (
                  <Link
                    key={role.id}
                    href={`/rollen/${role.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${role.circle?.color}20` }}
                    >
                      {role.circle?.icon || "⭕"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.circle?.name}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Account Info */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Account
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">E-Mail</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">Anmeldung via</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {user.app_metadata?.provider || "E-Mail"}
                </span>
              </div>
              {person && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground">Mitglied seit</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(person.created_at).toLocaleDateString("de-DE", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <AdminEmails
              initialEmails={allowedEmails}
              adminEmail={adminEmail}
            />
          )}

          {/* Not linked warning */}
          {!person && (
            <div className="bg-[var(--np-yellow-light)] rounded-2xl border border-[var(--np-yellow)]/20 p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--np-yellow)] flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a4a00" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#5a4a00]">Account nicht verknüpft</p>
                  <p className="text-sm text-[#5a4a00]/80 mt-1">
                    Dein Account ist noch nicht mit einem Neckarpiraten-Mitglied verknüpft.
                    Bitte wende dich an den Vorstand.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="pt-4">
            <LogoutButton />
          </div>
        </div>
      </main>

    </AppShell>
  );
}
