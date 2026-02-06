import { redirect } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getCircles } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { TensionForm } from "./tension-form";

export default async function NeuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get person from database
  const { data: person } = await supabase
    .from("persons")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  // If no person linked, use user.id as fallback (will need to be linked later)
  const personId = person?.id || user.id;

  const circles = await getCircles();

  // Filter out Anker-Kreis (root circle without parent)
  const displayCircles = circles.filter((c: any) => c.parent_circle_id !== null);

  return (
    <AppShell>
      <Header title="Neue Spannung" showBack backHref="/spannungen" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 py-6 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Spannung melden</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Beschreibe ein Problem oder eine Verbesserungsidee
            </p>
          </div>

          <TensionForm circles={displayCircles} personId={personId} />
        </div>
      </main>

    </AppShell>
  );
}
