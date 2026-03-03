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
import { updateSubtask } from "@/lib/supabase/actions";

interface Person {
  id: string;
  name: string;
  email?: string;
}

interface SubtaskActionsProps {
  subtaskId: string;
  currentStatus: string;
  personId: string;
  createdBy: string;
  persons: Person[];
  currentTitle: string;
  currentDescription: string;
  currentContactPersonId: string;
}

export function SubtaskActions({
  subtaskId,
  currentStatus,
  personId,
  createdBy,
  persons,
  currentTitle,
  currentDescription,
  currentContactPersonId,
}: SubtaskActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit details dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(currentTitle);
  const [editDescription, setEditDescription] = useState(currentDescription);
  const [editContactPersonId, setEditContactPersonId] = useState(currentContactPersonId);

  const isCreator = personId === createdBy;

  const handleAction = async (status: 'OPEN' | 'IN_PROGRESS' | 'DONE') => {
    setIsSubmitting(true);
    await updateSubtask(subtaskId, { status });
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

    const result = await updateSubtask(subtaskId, {
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      contactPersonId: editContactPersonId || null,
    });

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setDetailsOpen(false);
    router.refresh();
    setIsSubmitting(false);
  };

  const editDialog = isCreator ? (
    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`${currentStatus === "DONE" ? "" : "w-full "}h-10 rounded-xl text-sm`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          Bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle>Unteraufgabe bearbeiten</DialogTitle>
          <DialogDescription>Titel, Beschreibung und Ansprechperson ändern.</DialogDescription>
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
            <label className="text-sm font-medium text-foreground">Ansprechperson</label>
            <Select value={editContactPersonId} onValueChange={setEditContactPersonId}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Ansprechperson wählen" /></SelectTrigger>
              <SelectContent>
                {persons.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
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

  if (currentStatus === "DONE") {
    return (
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => handleAction('OPEN')}
          disabled={isSubmitting}
          className="flex-1 h-10 rounded-xl text-sm"
        >
          Wieder aufmachen
        </Button>
        {editDialog}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {editDialog}

      <div className="flex gap-3">
        {currentStatus === "OPEN" && (
          <Button
            variant="default"
            onClick={() => handleAction('IN_PROGRESS')}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl"
          >
            {isSubmitting ? "Wird gespeichert..." : "In Arbeit nehmen"}
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
          {isSubmitting ? "Wird gespeichert..." : "Erledigt"}
        </Button>
      </div>
    </div>
  );
}
