"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addAllowedEmail, removeAllowedEmail } from "@/lib/supabase/actions";

interface AllowedEmail {
  id: string;
  email: string;
  added_by: string | null;
  created_at: string;
}

interface AdminEmailsProps {
  initialEmails: AllowedEmail[];
  adminEmail: string | null;
}

export function AdminEmails({ initialEmails, adminEmail }: AdminEmailsProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!newEmail.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await addAllowedEmail(newEmail);
      if (result.error) {
        if (result.error === "already_exists") {
          setError("Diese E-Mail ist bereits freigeschaltet.");
        } else if (result.error === "invalid_email") {
          setError("Bitte eine gültige E-Mail-Adresse eingeben.");
        } else {
          setError(result.error);
        }
        return;
      }
      // Optimistically add to list
      setEmails((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          email: newEmail.toLowerCase().trim(),
          added_by: null,
          created_at: new Date().toISOString(),
        },
      ]);
      setNewEmail("");
    });
  };

  const handleRemove = (id: string, email: string) => {
    if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) return;
    setError(null);

    startTransition(async () => {
      const result = await removeAllowedEmail(id);
      if (result.error) {
        if (result.error === "cannot_remove_admin") {
          setError("Die Admin-E-Mail kann nicht entfernt werden.");
        } else {
          setError(result.error);
        }
        return;
      }
      setEmails((prev) => prev.filter((e) => e.id !== id));
    });
  };

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2 className="text-sm font-medium text-muted-foreground">
          Admin: Freigeschaltete E-Mails
        </h2>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {/* Email list */}
      <div className="space-y-2 mb-4">
        {emails.map((entry) => {
          const isAdmin = adminEmail && entry.email.toLowerCase() === adminEmail.toLowerCase();
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{entry.email}</p>
                {isAdmin && (
                  <span className="text-xs text-primary font-medium">Admin</span>
                )}
              </div>
              {!isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(entry.id, entry.email)}
                  disabled={isPending}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              )}
            </div>
          );
        })}
        {emails.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">
            Noch keine E-Mails in der Datenbank. Die Env-Variable wird als Fallback genutzt.
          </p>
        )}
      </div>

      {/* Add form */}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="neue@email.de"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="h-10 rounded-xl"
        />
        <Button
          onClick={handleAdd}
          disabled={isPending || !newEmail.trim()}
          className="h-10 rounded-xl px-4 flex-shrink-0"
        >
          {isPending ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
