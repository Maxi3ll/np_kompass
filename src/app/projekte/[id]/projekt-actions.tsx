"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { updateProjekt, deleteProjekt } from "@/lib/supabase/actions";

interface Person {
  id: string;
  name: string;
}

interface Circle {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface ProjektActionsProps {
  projektId: string;
  currentStatus: string;
  personId?: string | null;
  createdBy?: string | null;
  coordinatorId?: string | null;
  canManage: boolean;
  currentTitle?: string;
  currentShortDescription?: string | null;
  currentDescription?: string | null;
  currentCoordinatorId?: string | null;
  currentCircleIds?: string[];
  currentStartDate?: string | null;
  currentEndDate?: string | null;
  circles?: Circle[];
  persons?: Person[];
}

export function ProjektActions({
  projektId,
  currentStatus,
  personId,
  createdBy,
  coordinatorId,
  canManage,
  currentTitle,
  currentShortDescription,
  currentDescription,
  currentCoordinatorId,
  currentCircleIds,
  currentStartDate,
  currentEndDate,
  circles = [],
  persons = [],
}: ProjektActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Edit form state
  const [title, setTitle] = useState(currentTitle || "");
  const [shortDescription, setShortDescription] = useState(currentShortDescription || "");
  const [description, setDescription] = useState(currentDescription || "");
  const [editCoordinatorId, setEditCoordinatorId] = useState(currentCoordinatorId || "");
  const [selectedCircleIds, setSelectedCircleIds] = useState<string[]>(currentCircleIds || []);
  const [startDate, setStartDate] = useState(currentStartDate || "");
  const [endDate, setEndDate] = useState(currentEndDate || "");

  const handleAction = async (status: 'OPEN' | 'IN_PROGRESS' | 'DONE') => {
    setIsSubmitting(true);
    await updateProjekt({ id: projektId, status });
    router.refresh();
    setIsSubmitting(false);
  };

  const handleOpenEdit = () => {
    setTitle(currentTitle || "");
    setShortDescription(currentShortDescription || "");
    setDescription(currentDescription || "");
    setEditCoordinatorId(currentCoordinatorId || "");
    setSelectedCircleIds(currentCircleIds || []);
    setStartDate(currentStartDate || "");
    setEndDate(currentEndDate || "");
    setEditError(null);
    setEditOpen(true);
  };

  const toggleCircle = (circleId: string) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId)
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId]
    );
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!title.trim()) {
      setEditError("Bitte gib einen Titel ein");
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setEditError("Das Enddatum darf nicht vor dem Startdatum liegen");
      return;
    }

    setIsSubmitting(true);

    const result = await updateProjekt({
      id: projektId,
      title: title.trim(),
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      coordinatorId: editCoordinatorId || null,
      circleIds: selectedCircleIds,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    if (result.error) {
      setEditError(result.error);
      setIsSubmitting(false);
      return;
    }

    setEditOpen(false);
    router.refresh();
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteProjekt(projektId);
    if (result.error) {
      setIsSubmitting(false);
      return;
    }
    router.push('/projekte');
    router.refresh();
  };

  if (!canManage) return null;

  return (
    <>
      {/* Edit Button */}
      <Button
        variant="outline"
        onClick={handleOpenEdit}
        className="w-full h-10 rounded-xl text-sm mb-3"
      >
          <Pencil size={16} className="mr-2" />
          Bearbeiten
        </Button>

      {/* Status Buttons */}
      {currentStatus === "DONE" ? (
        <Button
          variant="outline"
          onClick={() => handleAction('OPEN')}
          disabled={isSubmitting}
          className="w-full h-10 rounded-xl text-sm"
        >
          Wieder aufmachen
        </Button>
      ) : (
        <div className="flex gap-3">
          {currentStatus === "OPEN" && (
            <Button
              variant="default"
              onClick={() => handleAction('IN_PROGRESS')}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl"
            >
              {isSubmitting ? "Wird gespeichert..." : "Umsetzen starten"}
            </Button>
          )}

          {currentStatus === "IN_PROGRESS" && (
            <Button
              variant="default"
              onClick={() => handleAction('OPEN')}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl"
            >
              Zurück auf Offen
            </Button>
          )}

          <Button
            onClick={() => handleAction('DONE')}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl bg-[var(--status-resolved)] hover:bg-[var(--status-resolved)]/90 text-white"
          >
            {isSubmitting ? "Wird gespeichert..." : "Abgeschlossen"}
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Projekt bearbeiten</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-5 pt-2">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium text-foreground">
                Titel <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-title"
                placeholder="Wie heißt das Projekt?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-xl"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/200
              </p>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label htmlFor="edit-shortDescription" className="text-sm font-medium text-foreground">
                Kurzbeschreibung
              </label>
              <Input
                id="edit-shortDescription"
                placeholder="Ein Satz, der das Projekt zusammenfasst (optional)"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="h-12 rounded-xl"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {shortDescription.length}/300
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium text-foreground">
                Beschreibung
              </label>
              <Textarea
                id="edit-description"
                placeholder="Beschreibe das Projekt genauer... (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] rounded-xl resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/5000
              </p>
            </div>

            {/* Coordinator */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Koordinator:in
              </label>
              <Select value={editCoordinatorId} onValueChange={(v) => setEditCoordinatorId(v === "__none__" ? "" : v)}>
                <SelectTrigger className="h-12 rounded-xl w-full">
                  <SelectValue placeholder="Wer koordiniert das Projekt? (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" className="text-muted-foreground">Keine Auswahl</SelectItem>
                  {persons.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Circles Multi-Select */}
            {circles.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Beteiligte Kreise
                </label>
                <div className="flex flex-wrap gap-2">
                  {circles.map((circle) => {
                    const isSelected = selectedCircleIds.includes(circle.id);
                    return (
                      <button
                        key={circle.id}
                        type="button"
                        onClick={() => toggleCircle(circle.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                        }`}
                      >
                        <span>{circle.icon || ''}</span>
                        {circle.name}
                      </button>
                    );
                  })}
                </div>
                {selectedCircleIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCircleIds.length} Kreis{selectedCircleIds.length > 1 ? 'e' : ''} ausgewählt
                  </p>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-startDate" className="text-sm font-medium text-foreground">
                  Startdatum
                </label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-endDate" className="text-sm font-medium text-foreground">
                  Enddatum
                </label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Error Message */}
            {editError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{editError}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="flex-1 h-12 rounded-xl"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl"
              >
                {isSubmitting ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Button */}
      <Button
        variant="ghost"
        onClick={() => setDeleteOpen(true)}
        className="w-full h-10 rounded-xl text-sm mt-3 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 size={16} className="mr-2" />
        Projekt löschen
      </Button>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Projekt löschen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Das Projekt &ldquo;{currentTitle}&rdquo; und alle zugehörigen Unteraufgaben werden unwiderruflich gelöscht.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 h-11 rounded-xl"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isSubmitting ? "Wird gelöscht..." : "Endgültig löschen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
