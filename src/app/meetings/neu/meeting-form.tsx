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
import { createMeeting } from "@/lib/supabase/actions";

interface Circle {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface MeetingFormProps {
  circles: Circle[];
}

export function MeetingForm({ circles }: MeetingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [circleId, setCircleId] = useState("");
  const [type, setType] = useState<"TACTICAL" | "GOVERNANCE">("TACTICAL");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [notes, setNotes] = useState("");

  // Default date to next week
  const getDefaultDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!circleId) {
      setError("Bitte wähle einen Kreis aus");
      return;
    }

    if (!date) {
      setError("Bitte wähle ein Datum aus");
      return;
    }

    setIsSubmitting(true);

    // Combine date and time
    const dateTime = new Date(`${date}T${time}:00`);

    const result = await createMeeting({
      type,
      circleId,
      date: dateTime.toISOString(),
      notes: notes.trim() || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/meetings");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Circle Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Kreis <span className="text-destructive">*</span>
        </label>
        <Select value={circleId} onValueChange={setCircleId}>
          <SelectTrigger className="h-12 rounded-xl w-full">
            <SelectValue placeholder="Für welchen Kreis ist das Meeting?" />
          </SelectTrigger>
          <SelectContent>
            {circles.map((circle) => (
              <SelectItem key={circle.id} value={circle.id}>
                <div className="flex items-center gap-2">
                  <span>{circle.icon || "⭕"}</span>
                  {circle.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Meeting Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Meeting-Typ
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType("TACTICAL")}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              type === "TACTICAL"
                ? "border-[var(--np-blue)] bg-[var(--np-blue)]/10"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <span className={`text-sm font-medium ${
              type === "TACTICAL" ? "text-[var(--np-blue)]" : "text-foreground"
            }`}>
              Taktisch
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Status-Updates, operative Themen
            </p>
          </button>
          <button
            type="button"
            onClick={() => setType("GOVERNANCE")}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              type === "GOVERNANCE"
                ? "border-[var(--circle-finanzen)] bg-[var(--circle-finanzen)]/10"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <span className={`text-sm font-medium ${
              type === "GOVERNANCE" ? "text-[var(--circle-finanzen)]" : "text-foreground"
            }`}>
              Governance
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Rollen, Strukturen, Regeln
            </p>
          </button>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-foreground">
            Datum <span className="text-destructive">*</span>
          </label>
          <Input
            id="date"
            type="date"
            value={date || getDefaultDate()}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="time" className="text-sm font-medium text-foreground">
            Uhrzeit
          </label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-foreground">
          Notizen
        </label>
        <Textarea
          id="notes"
          placeholder="Themen, Vorbereitung, Hinweise... (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[80px] rounded-xl resize-none"
        />
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
          className="w-full h-12 rounded-xl"
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
            "Meeting planen"
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
