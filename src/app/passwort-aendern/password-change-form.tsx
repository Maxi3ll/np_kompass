"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/supabase/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Passwort muss mindestens 8 Zeichen lang sein.";
  }
  if (!/[a-z]/.test(password)) {
    return "Passwort muss mindestens einen Kleinbuchstaben enthalten.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Passwort muss mindestens einen Großbuchstaben enthalten.";
  }
  if (!/[0-9]/.test(password)) {
    return "Passwort muss mindestens eine Ziffer enthalten.";
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "Passwort muss mindestens ein Sonderzeichen enthalten.";
  }
  return null;
}

export function PasswordChangeForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwörter stimmen nicht überein.");
      setIsLoading(false);
      return;
    }

    const result = await updatePassword(password);

    if (result.error === "password_too_short") {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      setIsLoading(false);
      return;
    }

    if (result.error) {
      setError("Passwort konnte nicht geändert werden. Bitte versuche es erneut.");
      setIsLoading(false);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center p-6 rounded-2xl bg-card border border-border/50">
        <div className="w-16 h-16 rounded-full bg-[var(--status-resolved)]/10 flex items-center justify-center mx-auto mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--status-resolved)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Passwort geändert!
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Dein Passwort wurde erfolgreich aktualisiert.
        </p>
        <button
          onClick={() => router.push("/profil")}
          className="text-sm text-primary hover:underline"
        >
          Zurück zum Profil
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-foreground">
          Neues Passwort setzen
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Wähle ein sicheres Passwort mit mindestens 8 Zeichen.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium text-foreground">
          Neues Passwort
        </label>
        <Input
          id="new-password"
          type="password"
          placeholder="Mindestens 8 Zeichen"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="h-12 rounded-xl"
        />
        <p className="text-xs text-muted-foreground">
          Groß- und Kleinbuchstaben, Ziffern und Sonderzeichen erforderlich.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
          Passwort bestätigen
        </label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Passwort wiederholen"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          disabled={isLoading}
          className="h-12 rounded-xl"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
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
            Wird gespeichert...
          </span>
        ) : (
          "Passwort ändern"
        )}
      </Button>
    </form>
  );
}
