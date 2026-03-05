import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { PasswordChangeForm } from "./password-change-form";

export default async function PasswortAendernPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <Header title="Passwort ändern" showBack backHref="/profil" />
      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 max-w-md mx-auto pt-8">
          <PasswordChangeForm />
        </div>
      </main>
    </AppShell>
  );
}
