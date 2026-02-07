import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getCircles, getAllRoles } from "@/lib/supabase/queries";
import { isCurrentUserAdmin } from "@/lib/supabase/actions";
import { KreiseRollenTabs } from "@/components/navigation/kreise-rollen-tabs";
import { KreiseContent } from "./kreise-content";

export const revalidate = 60;

export default async function KreisePage() {
  const [circles, roles, isAdmin] = await Promise.all([
    getCircles(),
    getAllRoles(),
    isCurrentUserAdmin(),
  ]);

  return (
    <AppShell>
      <Header title="Kreise" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <KreiseRollenTabs />
        <KreiseContent circles={circles} roles={roles} isAdmin={isAdmin} />
      </main>
    </AppShell>
  );
}
