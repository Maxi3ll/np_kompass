"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPassword,
  signUpWithPassword,
  resetPassword,
} from "@/lib/supabase/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "login" | "register" | "forgot";

function Spinner() {
  return (
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
  );
}

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

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
    setPassword("");
    setPasswordConfirm("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim() || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      setIsLoading(false);
      return;
    }

    const result = await signInWithPassword(email.trim(), password);

    if (result.error === "invalid_credentials") {
      setError("E-Mail oder Passwort falsch.");
      setIsLoading(false);
      return;
    }

    if (result.error) {
      setError("Anmeldung fehlgeschlagen. Bitte versuche es erneut.");
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim() || !password) {
      setError("Bitte alle Felder ausfüllen.");
      setIsLoading(false);
      return;
    }

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

    const result = await signUpWithPassword(email.trim(), password);

    if (result.error === "password_too_short") {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      setIsLoading(false);
      return;
    }

    if (result.error === "access_denied") {
      setError(
        "Diese E-Mail ist nicht freigeschaltet. Bitte wende dich an den Kompass-Admin."
      );
      setIsLoading(false);
      return;
    }

    if (result.error === "already_registered") {
      setError(
        "Dieses Konto wurde bereits aktiviert. Bitte melde dich an."
      );
      setIsLoading(false);
      return;
    }

    if (result.error) {
      setError("Aktivierung fehlgeschlagen. Bitte versuche es erneut.");
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim()) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      setIsLoading(false);
      return;
    }

    const result = await resetPassword(email.trim());

    if (result.error) {
      setError("Fehler beim Senden. Bitte versuche es erneut.");
      setIsLoading(false);
      return;
    }

    setSuccessMessage(
      "Falls ein Konto existiert, wurde eine E-Mail zum Zurücksetzen gesendet."
    );
    setIsLoading(false);
  };

  // Success state for forgot password
  if (successMessage) {
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
          E-Mail gesendet!
        </h2>
        <p className="text-sm text-muted-foreground mb-4">{successMessage}</p>
        <button
          onClick={() => switchMode("login")}
          className="text-sm text-primary hover:underline"
        >
          Zurück zur Anmeldung
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Login Form */}
      {mode === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-Mail-Adresse
            </label>
            <Input
              id="email"
              type="email"
              placeholder="max@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Passwort
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Passwort eingeben"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <Spinner />
                Wird angemeldet...
              </span>
            ) : (
              "Anmelden"
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="text-primary hover:underline"
            >
              Konto aktivieren
            </button>
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-muted-foreground hover:underline"
            >
              Passwort vergessen?
            </button>
          </div>
        </form>
      )}

      {/* Register Form */}
      {mode === "register" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--np-blue)]/5 border border-[var(--np-blue)]/20">
            <p className="text-sm text-muted-foreground text-center">
              Deine E-Mail-Adresse muss zuerst vom <strong className="text-foreground">Kompass-Admin</strong> freigeschaltet werden. Wende dich an den aktuellen Rolleninhaber, falls du noch keinen Zugang hast.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-email" className="text-sm font-medium text-foreground">
              E-Mail-Adresse
            </label>
            <Input
              id="reg-email"
              type="email"
              placeholder="max@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-password" className="text-sm font-medium text-foreground">
              Passwort
            </label>
            <Input
              id="reg-password"
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
            <label htmlFor="reg-password-confirm" className="text-sm font-medium text-foreground">
              Passwort bestätigen
            </label>
            <Input
              id="reg-password-confirm"
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
                <Spinner />
                Wird aktiviert...
              </span>
            ) : (
              "Konto aktivieren"
            )}
          </Button>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-primary hover:underline"
            >
              Bereits aktiviert? Anmelden
            </button>
          </div>
        </form>
      )}

      {/* Forgot Password Form */}
      {mode === "forgot" && (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-foreground">
              Passwort zurücksetzen
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum
              Zurücksetzen.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
              E-Mail-Adresse
            </label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="max@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                <Spinner />
                Wird gesendet...
              </span>
            ) : (
              "Link senden"
            )}
          </Button>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-primary hover:underline"
            >
              Zurück zur Anmeldung
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
