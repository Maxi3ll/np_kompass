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
import { createTension } from "@/lib/supabase/actions";

interface Circle {
  id: string;
  name: string;
  color?: string;
}

interface TensionFormProps {
  circles: Circle[];
  personId: string;
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Niedrig", description: "Kann warten" },
  { value: "MEDIUM", label: "Mittel", description: "Sollte bald bearbeitet werden" },
  { value: "HIGH", label: "Hoch", description: "Dringend!" },
] as const;

export function TensionForm({ circles, personId }: TensionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [circleId, setCircleId] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Bitte gib einen Titel ein");
      return;
    }

    if (!circleId) {
      setError("Bitte wähle einen Kreis aus");
      return;
    }

    setIsSubmitting(true);

    const result = await createTension({
      title: title.trim(),
      description: description.trim() || undefined,
      circleId,
      priority,
      raisedBy: personId,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/spannungen");
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
          placeholder="Was ist das Problem oder die Idee?"
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
          placeholder="Beschreibe die Spannung genauer... (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px] rounded-xl resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {description.length}/2000
        </p>
      </div>

      {/* Circle Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Kreis <span className="text-destructive">*</span>
        </label>
        <Select value={circleId} onValueChange={setCircleId}>
          <SelectTrigger className="h-12 rounded-xl w-full">
            <SelectValue placeholder="In welchem Kreis gehört die Spannung?" />
          </SelectTrigger>
          <SelectContent>
            {circles.map((circle) => (
              <SelectItem key={circle.id} value={circle.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: circle.color || "#4A90D9" }}
                  />
                  {circle.name}
                </div>
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
            "Spannung melden"
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
