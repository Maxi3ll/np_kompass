"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/lib/supabase/actions";

export function DeleteAccountButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteAccount();
    if (result?.error) {
      alert("Fehler beim Löschen: " + result.error);
      setIsDeleting(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        Konto und Daten löschen
      </button>
    );
  }

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-destructive">
        Konto unwiderruflich löschen?
      </p>
      <p className="text-xs text-muted-foreground">
        Alle deine Daten werden gelöscht: Profil, Benachrichtigungen und Rollenzuweisungen.
        Erstellte Spannungen und Meeting-Protokolle werden anonymisiert.
        Diese Aktion kann nicht rückgängig gemacht werden.
      </p>
      <p className="text-xs text-muted-foreground">
        Tippe <strong className="text-foreground">LÖSCHEN</strong> zur Bestätigung:
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="LÖSCHEN"
        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowConfirm(false);
            setConfirmText("");
          }}
          className="flex-1"
        >
          Abbrechen
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={confirmText !== "LÖSCHEN" || isDeleting}
          className="flex-1"
        >
          {isDeleting ? "Wird gelöscht..." : "Endgültig löschen"}
        </Button>
      </div>
    </div>
  );
}
