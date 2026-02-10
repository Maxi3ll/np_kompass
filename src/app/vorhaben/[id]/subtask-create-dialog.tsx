"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { createSubtask } from "@/lib/supabase/actions";

interface Person {
  id: string;
  name: string;
}

interface SubtaskCreateDialogProps {
  vorhabenId: string;
  personId: string;
  persons: Person[];
}

export function SubtaskCreateDialog({ vorhabenId, personId, persons }: SubtaskCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactPersonId, setContactPersonId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Bitte gib einen Titel ein");
      return;
    }

    setIsSubmitting(true);

    const result = await createSubtask({
      vorhabenId,
      title: title.trim(),
      description: description.trim() || undefined,
      contactPersonId: contactPersonId || undefined,
      createdBy: personId,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setTitle("");
    setDescription("");
    setContactPersonId("");
    setOpen(false);
    router.refresh();
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Unteraufgabe hinzufügen
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Unteraufgabe hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label htmlFor="subtaskTitle" className="text-sm font-medium text-foreground">
              Titel <span className="text-destructive">*</span>
            </label>
            <Input
              id="subtaskTitle"
              placeholder="Was muss erledigt werden?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subtaskDescription" className="text-sm font-medium text-foreground">
              Beschreibung
            </label>
            <Textarea
              id="subtaskDescription"
              placeholder="Details zur Unteraufgabe (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] rounded-xl resize-none"
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Ansprechperson
            </label>
            <Select value={contactPersonId} onValueChange={setContactPersonId}>
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue placeholder="Wer ist zuständig? (optional)" />
              </SelectTrigger>
              <SelectContent>
                {persons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl"
          >
            {isSubmitting ? "Wird erstellt..." : "Erstellen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
