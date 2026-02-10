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
import { createVorhaben } from "@/lib/supabase/actions";

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

interface VorhabenFormProps {
  personId: string;
  circles: Circle[];
  persons: Person[];
}

export function VorhabenForm({ personId, circles, persons }: VorhabenFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [coordinatorId, setCoordinatorId] = useState("");
  const [selectedCircleIds, setSelectedCircleIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toggleCircle = (circleId: string) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId)
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Bitte gib einen Titel ein");
      return;
    }

    setIsSubmitting(true);

    const result = await createVorhaben({
      title: title.trim(),
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      coordinatorId: coordinatorId || undefined,
      createdBy: personId,
      circleIds: selectedCircleIds.length > 0 ? selectedCircleIds : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/vorhaben");
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
          placeholder="Wie heißt das Vorhaben?"
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
        <label htmlFor="shortDescription" className="text-sm font-medium text-foreground">
          Kurzbeschreibung
        </label>
        <Input
          id="shortDescription"
          placeholder="Ein Satz, der das Vorhaben zusammenfasst (optional)"
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
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Beschreibung
        </label>
        <Textarea
          id="description"
          placeholder="Beschreibe das Vorhaben genauer... (optional)"
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
        <Select value={coordinatorId} onValueChange={setCoordinatorId}>
          <SelectTrigger className="h-12 rounded-xl w-full">
            <SelectValue placeholder="Wer koordiniert das Vorhaben? (optional)" />
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

      {/* Circles Multi-Select */}
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
            "Vorhaben erstellen"
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
