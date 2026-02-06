"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateTension, resolveTension, startWorkingOnTension } from "@/lib/supabase/actions";

interface TensionActionsProps {
  tensionId: string;
  currentStatus: string;
  currentNextAction?: string | null;
  personId: string;
}

export function TensionActions({
  tensionId,
  currentStatus,
  currentNextAction,
  personId,
}: TensionActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [nextAction, setNextAction] = useState(currentNextAction || "");

  // Resolve dialog state
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolution, setResolution] = useState("");

  const handleStartWorking = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await startWorkingOnTension(tensionId, personId, nextAction || undefined);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setEditOpen(false);
    router.refresh();
    setIsSubmitting(false);
  };

  const handleUpdateNextAction = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await updateTension({
      id: tensionId,
      nextAction: nextAction || null,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setEditOpen(false);
    router.refresh();
    setIsSubmitting(false);
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      setError("Bitte beschreibe kurz die Lösung");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await resolveTension(tensionId, resolution.trim());

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setResolveOpen(false);
    router.refresh();
    setIsSubmitting(false);
  };

  if (currentStatus === "RESOLVED") {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Edit / Start Working Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="flex-1 h-12 rounded-xl"
            >
              {currentStatus === "NEW" ? "Übernehmen" : "Bearbeiten"}
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>
                {currentStatus === "NEW" ? "Spannung übernehmen" : "Spannung bearbeiten"}
              </DialogTitle>
              <DialogDescription>
                {currentStatus === "NEW"
                  ? "Du übernimmst die Verantwortung für diese Spannung."
                  : "Aktualisiere den nächsten Schritt."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nächster Schritt
                </label>
                <Textarea
                  placeholder="Was ist der nächste konkrete Schritt?"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="min-h-[100px] rounded-xl resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 h-11 rounded-xl"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={currentStatus === "NEW" ? handleStartWorking : handleUpdateNextAction}
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-primary"
                >
                  {isSubmitting ? "Speichern..." : "Speichern"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resolve Dialog */}
        <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex-1 h-12 rounded-xl bg-[var(--status-resolved)] hover:bg-[var(--status-resolved)]/90 text-white"
            >
              Erledigt
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>Spannung abschließen</DialogTitle>
              <DialogDescription>
                Beschreibe kurz, wie die Spannung gelöst wurde.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Lösung <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Wie wurde das Problem gelöst?"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="min-h-[100px] rounded-xl resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setResolveOpen(false)}
                  className="flex-1 h-11 rounded-xl"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleResolve}
                  disabled={isSubmitting || !resolution.trim()}
                  className="flex-1 h-11 rounded-xl bg-[var(--status-resolved)] hover:bg-[var(--status-resolved)]/90 text-white"
                >
                  {isSubmitting ? "Speichern..." : "Als erledigt markieren"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status change button for IN_PROGRESS -> back to NEW */}
      {currentStatus === "IN_PROGRESS" && (
        <Button
          variant="outline"
          onClick={async () => {
            setIsSubmitting(true);
            await updateTension({
              id: tensionId,
              status: "NEW",
              assignedTo: null,
            });
            router.refresh();
            setIsSubmitting(false);
          }}
          disabled={isSubmitting}
          className="w-full h-10 rounded-xl text-sm"
        >
          Zurück auf "Neu" setzen
        </Button>
      )}
    </div>
  );
}
