import { redirect } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getCircles } from "@/lib/supabase/queries";
import { getPersonsList } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/server";
import { VorhabenForm } from "./vorhaben-form";

export default async function NeuesVorhabenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: person } = await supabase
    .from("persons")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const personId = person?.id || user.id;

  const [circles, personsResult] = await Promise.all([
    getCircles(),
    getPersonsList(),
  ]);

  const displayCircles = circles.filter((c: any) => c.parent_circle_id !== null);
  const persons = personsResult.persons || [];

  return (
    <AppShell>
      <Header title="Neues Vorhaben" showBack backHref="/vorhaben" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 py-6 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Vorhaben erstellen</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Starte eine neue Initiative oder ein Projekt
            </p>
          </div>

          <VorhabenForm
            personId={personId}
            circles={displayCircles}
            persons={persons}
          />
        </div>
      </main>
    </AppShell>
  );
}
