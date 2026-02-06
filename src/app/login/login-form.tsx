"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
    setPassword("");
    setPasswordConfirm("");
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.");
      setIsGoogleLoading(false);
    }
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

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      setIsLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwörter stimmen nicht überein.");
      setIsLoading(false);
      return;
    }

    const result = await signUpWithPassword(email.trim(), password);

    if (result.error === "access_denied") {
      setError(
        "Diese E-Mail ist nicht freigeschaltet. Bitte wende dich an den Admin."
      );
      setIsLoading(false);
      return;
    }

    if (result.error === "already_registered") {
      setError(
        "Diese E-Mail ist bereits registriert. Bitte melde dich an."
      );
      setIsLoading(false);
      return;
    }

    if (result.error) {
      setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
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

    const result = await resetPassword(
      email.trim(),
      `${window.location.origin}/auth/callback`
    );

    if (result.error === "access_denied") {
      setError("Diese E-Mail ist nicht freigeschaltet.");
      setIsLoading(false);
      return;
    }

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
      {/* Google Login (not in forgot mode) */}
      {mode !== "forgot" && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-12 rounded-xl font-medium"
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Wird verbunden...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <GoogleIcon />
                Mit Google anmelden
              </span>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                oder per E-Mail
              </span>
            </div>
          </div>
        </>
      )}

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
              disabled={isLoading || isGoogleLoading}
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
              disabled={isLoading || isGoogleLoading}
              className="h-12 rounded-xl"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
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
              Noch kein Konto? Registrieren
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
              disabled={isLoading || isGoogleLoading}
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
              placeholder="Mindestens 6 Zeichen"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isGoogleLoading}
              className="h-12 rounded-xl"
            />
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
              disabled={isLoading || isGoogleLoading}
              className="h-12 rounded-xl"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-12 rounded-xl bg-[var(--np-blue)] hover:bg-[var(--np-blue)]/90"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Wird registriert...
              </span>
            ) : (
              "Registrieren"
            )}
          </Button>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-primary hover:underline"
            >
              Bereits ein Konto? Anmelden
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
