"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, UserPlus } from "lucide-react";
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
import { updateTension, resolveTension, deleteTension, takeOverTension } from "@/lib/supabase/actions";

interface Circle {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface PersonOption {
  id: string;
  name: string;
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
  currentAssignedTo: string | null;
  isAdmin: boolean;
  persons: PersonOption[];
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
  currentAssignedTo,
  isAdmin,
  persons,
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

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Assign dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTo, setAssignTo] = useState(currentAssignedTo || "");

  // Reset dialog state ("Zurück auf Neu")
  const [resetOpen, setResetOpen] = useState(false);

  const isCreator = personId === raisedBy;
  const isAssignee = personId === currentAssignedTo;
  const canAssign = isCreator || isAdmin;
  const canManageStatus = isCreator || isAssignee || isAdmin;

  const handleStartWorking = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await takeOverTension(tensionId, nextAction || undefined);

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

  const handleAssign = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await updateTension({
      id: tensionId,
      assignedTo: assignTo || null,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setAssignOpen(false);
    router.refresh();
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await deleteTension(tensionId);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/spannungen");
  };

  if (currentStatus === "RESOLVED") {
    return (isCreator || isAdmin) ? (
      <div className="flex gap-3">
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-10 rounded-xl text-sm">
              <Pencil size={16} className="mr-2" />
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
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={200} className="rounded-xl" />
                <p className="text-xs text-muted-foreground text-right">{editTitle.length}/200</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Beschreibung</label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} maxLength={2000} className="min-h-[100px] rounded-xl resize-none" />
                <p className="text-xs text-muted-foreground text-right">{editDescription.length}/2000</p>
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

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-10 rounded-xl text-sm text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 size={16} className="mr-2" />
              Löschen
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>Spannung löschen</DialogTitle>
              <DialogDescription>Möchtest du diese Spannung wirklich löschen? Alle Kommentare werden ebenfalls entfernt. Diese Aktion kann nicht rückgängig gemacht werden.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1 h-11 rounded-xl">Abbrechen</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="flex-1 h-11 rounded-xl">
                  {isSubmitting ? "Löschen..." : "Endgültig löschen"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-3">
      {/* Edit Details Button (creator or admin) */}
      {(isCreator || isAdmin) && (
        <div className="flex gap-3">
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 h-10 rounded-xl text-sm">
                <Pencil size={16} className="mr-2" />
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
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={200} className="rounded-xl" />
                  <p className="text-xs text-muted-foreground text-right">{editTitle.length}/200</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Beschreibung</label>
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} maxLength={2000} className="min-h-[100px] rounded-xl resize-none" />
                  <p className="text-xs text-muted-foreground text-right">{editDescription.length}/2000</p>
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

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 rounded-xl text-sm text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 size={16} className="mr-2" />
                Löschen
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 rounded-2xl">
              <DialogHeader>
                <DialogTitle>Spannung löschen</DialogTitle>
                <DialogDescription>Möchtest du diese Spannung wirklich löschen? Alle Kommentare werden ebenfalls entfernt. Diese Aktion kann nicht rückgängig gemacht werden.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1 h-11 rounded-xl">Abbrechen</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="flex-1 h-11 rounded-xl">
                    {isSubmitting ? "Löschen..." : "Endgültig löschen"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Assign Button (creator or admin) */}
      {canAssign && (
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-10 rounded-xl text-sm">
              <UserPlus size={16} className="mr-2" />
              {currentAssignedTo ? 'Neu zuweisen' : 'Zuweisen'}
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>{currentAssignedTo ? 'Spannung neu zuweisen' : 'Spannung zuweisen'}</DialogTitle>
              <DialogDescription>Wähle eine Person aus, die sich um diese Spannung kümmern soll.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Person</label>
                <Select value={assignTo} onValueChange={setAssignTo}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Person auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {persons.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setAssignOpen(false)} className="flex-1 h-11 rounded-xl">Abbrechen</Button>
                <Button onClick={handleAssign} disabled={isSubmitting || !assignTo} className="flex-1 h-11 rounded-xl bg-primary">
                  {isSubmitting ? "Speichern..." : "Zuweisen"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex gap-3">
        {/* "Übernehmen" only when NEW and nobody assigned */}
        {currentStatus === "NEW" && !currentAssignedTo && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex-1 h-12 rounded-xl">
                Übernehmen
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 rounded-2xl">
              <DialogHeader>
                <DialogTitle>Spannung übernehmen</DialogTitle>
                <DialogDescription>Du übernimmst die Verantwortung für diese Spannung.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nächster Schritt</label>
                  <Textarea
                    placeholder="Was ist der nächste konkrete Schritt?"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    className="min-h-[100px] rounded-xl resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">{nextAction.length}/500</p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 h-11 rounded-xl">Abbrechen</Button>
                  <Button onClick={handleStartWorking} disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-primary">
                    {isSubmitting ? "Speichern..." : "Übernehmen"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* "Jetzt bearbeiten" when NEW and someone is assigned */}
        {currentStatus === "NEW" && currentAssignedTo && canManageStatus && (
          <Button
            variant="default"
            className="flex-1 h-12 rounded-xl"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              setError(null);
              const result = await updateTension({ id: tensionId, status: "IN_PROGRESS" });
              if (result.error) {
                setError(result.error);
                setIsSubmitting(false);
                return;
              }
              router.refresh();
              setIsSubmitting(false);
            }}
          >
            {isSubmitting ? "..." : "Jetzt bearbeiten"}
          </Button>
        )}

        {/* "Nächster Schritt" when IN_PROGRESS */}
        {currentStatus === "IN_PROGRESS" && canManageStatus && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex-1 h-12 rounded-xl">
                Nächster Schritt
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 rounded-2xl">
              <DialogHeader>
                <DialogTitle>Nächsten Schritt aktualisieren</DialogTitle>
                <DialogDescription>Aktualisiere den nächsten Schritt für diese Spannung.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nächster Schritt</label>
                  <Textarea
                    placeholder="Was ist der nächste konkrete Schritt?"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    className="min-h-[100px] rounded-xl resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">{nextAction.length}/500</p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 h-11 rounded-xl">Abbrechen</Button>
                  <Button onClick={handleUpdateNextAction} disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-primary">
                    {isSubmitting ? "Speichern..." : "Speichern"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Resolve Dialog */}
        {canManageStatus && (
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
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground text-right">{resolution.length}/2000</p>
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
        )}
      </div>

      {/* Status change button for IN_PROGRESS -> back to NEW */}
      {currentStatus === "IN_PROGRESS" && canManageStatus && (
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl text-sm"
            >
              Zurück auf "Neu" setzen
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>Status zurücksetzen</DialogTitle>
              <DialogDescription>
                Die Spannung wird auf "Neu" zurückgesetzt und die Zuweisung wird aufgehoben.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setResetOpen(false)} className="flex-1 h-11 rounded-xl">Abbrechen</Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsSubmitting(true);
                    setError(null);
                    const result = await updateTension({ id: tensionId, status: "NEW", assignedTo: null });
                    if (result.error) {
                      setError(result.error);
                      setIsSubmitting(false);
                      return;
                    }
                    setResetOpen(false);
                    router.refresh();
                    setIsSubmitting(false);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  {isSubmitting ? "..." : "Zurücksetzen"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
