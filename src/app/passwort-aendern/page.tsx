import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { PasswordChangeForm } from "./password-change-form";

interface PageProps {
  searchParams: Promise<{ reset?: string }>;
}

export default async function PasswortAendernPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isResetFlow = params.reset === "true";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Reset-Flow: Clean layout without navigation (like login page)
  if (isResetFlow) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 flex items-center justify-center p-5">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--np-blue)] to-[var(--np-blue-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl">🧭</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Neckarpiraten</h1>
              <p className="text-muted-foreground mt-1">Kompass</p>
            </div>
            <PasswordChangeForm isResetFlow />
          </div>
        </main>
      </div>
    );
  }

  // Normal flow: From profile with full navigation
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
