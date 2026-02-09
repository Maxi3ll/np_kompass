"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask } from "@/lib/supabase/actions";

interface Person {
  id: string;
  name: string;
}

interface TaskFormProps {
  personId: string;
  persons: Person[];
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Niedrig", description: "Kann warten" },
  { value: "MEDIUM", label: "Mittel", description: "Sollte bald erledigt werden" },
  { value: "HIGH", label: "Hoch", description: "Dringend!" },
] as const;

export function TaskForm({ personId, persons }: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Bitte gib einen Titel ein");
      return;
    }

    setIsSubmitting(true);

    const result = await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      createdBy: personId,
      assignedTo: assignedTo || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/aufgaben");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Titel <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          placeholder="Was muss erledigt werden?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 rounded-xl"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground text-right">
          {title.length}/200
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Beschreibung
        </label>
        <Textarea
          id="description"
          placeholder="Beschreibe die Aufgabe genauer... (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px] rounded-xl resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {description.length}/2000
        </p>
      </div>

      {/* Assigned To */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Zugewiesen an
        </label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger className="h-12 rounded-xl w-full">
            <SelectValue placeholder="Wer soll die Aufgabe erledigen? (optional)" />
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

      {/* Priority Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Priorität
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPriority(option.value)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                priority === option.value
                  ? option.value === "HIGH"
                    ? "border-[var(--status-escalated)] bg-[var(--status-escalated)]/10"
                    : option.value === "MEDIUM"
                    ? "border-[var(--np-yellow)] bg-[var(--np-yellow)]/10"
                    : "border-[var(--np-blue)] bg-[var(--np-blue)]/10"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  priority === option.value
                    ? option.value === "HIGH"
                      ? "text-[var(--status-escalated)]"
                      : option.value === "MEDIUM"
                      ? "text-[var(--np-yellow-dark)]"
                      : "text-[var(--np-blue)]"
                    : "text-foreground"
                }`}
              >
                {option.label}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium text-foreground">
            Startdatum
          </label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="endDate" className="text-sm font-medium text-foreground">
            Enddatum
          </label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl bg-[var(--np-yellow)] hover:bg-[var(--np-yellow)]/90 text-[#5a4a00] font-semibold text-base"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Wird gespeichert...
            </span>
          ) : (
            "Aufgabe erstellen"
          )}
        </Button>
      </div>

      {/* Cancel Link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
