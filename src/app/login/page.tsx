import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

interface PageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--np-blue)] to-[var(--np-blue-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">⛵</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Neckarpiraten</h1>
            <p className="text-muted-foreground mt-1">Kompass</p>
          </div>

          {/* Error Messages */}
          {params.error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">
                {params.error === "auth"
                  ? "Anmeldung fehlgeschlagen. Bitte versuche es erneut."
                  : params.error === "access_denied"
                  ? "Zugriff verweigert. Dein Account ist nicht für diese App freigeschaltet."
                  : "Ein Fehler ist aufgetreten."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {params.message && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--status-resolved)]/10 border border-[var(--status-resolved)]/20">
              <p className="text-sm text-[var(--status-resolved)] text-center">
                {params.message === "check-email"
                  ? "Prüfe deine E-Mails für den Login-Link!"
                  : params.message}
              </p>
            </div>
          )}

          <LoginForm />

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            Nur für Mitglieder der Neckarpiraten e.V.
          </p>
        </div>
      </main>
    </div>
  );
}
