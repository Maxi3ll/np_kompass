import { redirect } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { TaskForm } from "./task-form";

export default async function NeueAufgabePage() {
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

  const personId = person?.id || user.id;

  // Get active persons for assignment dropdown
  const { data: persons } = await supabase
    .from("persons")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <AppShell>
      <Header title="Neue Aufgabe" showBack backHref="/aufgaben" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 py-6 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Aufgabe erstellen</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Erstelle eine neue Aufgabe und weise sie optional jemandem zu
            </p>
          </div>

          <TaskForm personId={personId} persons={persons || []} />
        </div>
      </main>
    </AppShell>
  );
}
