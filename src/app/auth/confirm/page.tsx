"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { EmailOtpType } from "@supabase/supabase-js";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const handleConfirm = async () => {
    if (!tokenHash || !type) {
      setError("Ungültiger Link. Bitte fordere einen neuen an.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (verifyError) {
      console.error("Verify OTP error:", verifyError.message);
      if (
        verifyError.message.includes("expired") ||
        verifyError.message.includes("invalid")
      ) {
        setError(
          "Dieser Link ist abgelaufen oder ungültig. Bitte fordere einen neuen an."
        );
      } else {
        setError("Bestätigung fehlgeschlagen. Bitte versuche es erneut.");
      }
      setIsLoading(false);
      return;
    }

    // Determine redirect based on type
    const redirectTo = type === "recovery" ? "/passwort-aendern?reset=true" : next;
    router.push(redirectTo);
    router.refresh();
  };

  // Invalid or missing parameters
  if (!tokenHash || !type) {
    return (
      <div className="text-center p-6 rounded-2xl bg-card border border-border/50">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--destructive)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Ungültiger Link
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Dieser Link ist ungültig oder unvollständig.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-primary hover:underline"
        >
          Zurück zur Anmeldung
        </button>
      </div>
    );
  }

  const isRecovery = type === "recovery";

  return (
    <div className="text-center p-6 rounded-2xl bg-card border border-border/50">
      <div className="w-16 h-16 rounded-full bg-[var(--np-blue)]/10 flex items-center justify-center mx-auto mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--np-blue)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isRecovery ? (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
          ) : (
            <>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </>
          )}
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-2">
        {isRecovery ? "Passwort zurücksetzen" : "E-Mail bestätigen"}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {isRecovery
          ? "Klicke auf den Button, um dein Passwort zurückzusetzen."
          : "Klicke auf den Button, um deine E-Mail-Adresse zu bestätigen."}
      </p>

      {error && (
        <p className="text-sm text-destructive mb-4">{error}</p>
      )}

      <Button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-[var(--np-blue)] hover:bg-[var(--np-blue)]/90"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Wird bestätigt...
          </span>
        ) : isRecovery ? (
          "Weiter zum Passwort ändern"
        ) : (
          "E-Mail bestätigen"
        )}
      </Button>

      <div className="mt-4">
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-muted-foreground hover:underline"
        >
          Zurück zur Anmeldung
        </button>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--np-blue)] to-[var(--np-blue-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🧭</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Neckarpiraten</h1>
            <p className="text-muted-foreground mt-1">Kompass</p>
          </div>

          <Suspense
            fallback={
              <div className="text-center p-6 rounded-2xl bg-card border border-border/50">
                <p className="text-sm text-muted-foreground">Wird geladen...</p>
              </div>
            }
          >
            <ConfirmContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
