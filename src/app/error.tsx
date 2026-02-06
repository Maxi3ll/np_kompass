"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Etwas ist schiefgelaufen
          </h1>
          <p className="text-muted-foreground mb-6">
            Es tut uns leid, aber es ist ein Fehler aufgetreten. Bitte versuche es erneut.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full h-12 rounded-xl"
            >
              Erneut versuchen
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="w-full h-12 rounded-xl"
            >
              Zur Startseite
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mt-6 p-4 rounded-xl bg-muted text-left">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
