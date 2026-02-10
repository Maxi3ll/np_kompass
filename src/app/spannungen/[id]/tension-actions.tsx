"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTension, resolveTension, startWorkingOnTension } from "@/lib/supabase/actions";

interface Circle {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface TensionActionsProps {
  tensionId: string;
  currentStatus: string;
  currentNextAction?: string | null;
  personId: string;
  raisedBy: string;
  circles: Circle[];
  currentTitle: string;
  currentDescription: string;
  currentCircleId: string;
  currentPriority: string;
}

export function TensionActions({
  tensionId,
  currentStatus,
  currentNextAction,
  personId,
  raisedBy,
  circles,
  currentTitle,
  currentDescription,
  currentCircleId,
  currentPriority,
}: TensionActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state (next action / take over)
  const [editOpen, setEditOpen] = useState(false);
  const [nextAction, setNextAction] = useState(currentNextAction || "");

  // Resolve dialog state
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolution, setResolution] = useState("");

  // Edit tension details dialog state (only for creator)
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(currentTitle);
  const [editDescription, setEditDescription] = useState(currentDescription);
  const [editCircleId, setEditCircleId] = useState(currentCircleId);
  const [editPriority, setEditPriority] = useState(currentPriority);

  const isCreator = personId === raisedBy;

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

  const handleSaveDetails = async () => {
    if (!editTitle.trim()) {
      setError("Titel darf nicht leer sein");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await updateTension({
      id: tensionId,
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      circleId: editCircleId,
      priority: editPriority as 'LOW' | 'MEDIUM' | 'HIGH',
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setDetailsOpen(false);
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
    return isCreator ? (
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="h-10 rounded-xl text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
            Bearbeiten
          </Button>
        </DialogTrigger>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Spannung bearbeiten</DialogTitle>
            <DialogDescription>Titel, Beschreibung, Kreis und Priorität ändern.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Titel <span className="text-destructive">*</span></label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Beschreibung</label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="min-h-[100px] rounded-xl resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kreis</label>
              <Select value={editCircleId} onValueChange={setEditCircleId}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {circles.map((c) => (<SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priorität</label>
              <Select value={editPriority} onValueChange={setEditPriority}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Niedrig</SelectItem>
                  <SelectItem value="MEDIUM">Mittel</SelectItem>
                  <SelectItem value="HIGH">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDetailsOpen(false)} className="flex-1 h-11 rounded-xl">Abbrechen</Button>
              <Button onClick={handleSaveDetails} disabled={isSubmitting || !editTitle.trim()} className="flex-1 h-11 rounded-xl bg-primary">{isSubmitting ? "Speichern..." : "Speichern"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    ) : null;
  }

  return (
    <div className="space-y-3">
      {/* Edit Details Button (only for creator) */}
      {isCreator && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-10 rounded-xl text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              Bearbeiten
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>Spannung bearbeiten</DialogTitle>
              <DialogDescription>Titel, Beschreibung, Kreis und Priorität ändern.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Titel <span className="text-destructive">*</span></label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Beschreibung</label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="min-h-[100px] rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Kreis</label>
                <Select value={editCircleId} onValueChange={setEditCircleId}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {circles.map((c) => (<SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Priorität</label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Niedrig</SelectItem>
                    <SelectItem value="MEDIUM">Mittel</SelectItem>
                    <SelectItem value="HIGH">Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDetailsOpen(false)} className="flex-1 h-11 rounded-xl">Abbrechen</Button>
                <Button onClick={handleSaveDetails} disabled={isSubmitting || !editTitle.trim()} className="flex-1 h-11 rounded-xl bg-primary">{isSubmitting ? "Speichern..." : "Speichern"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
