"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/layout/user-context";
import { updateMeeting } from "@/lib/supabase/actions";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Circle {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface EditMeetingButtonProps {
  meetingId: string;
  currentType: "TACTICAL" | "GOVERNANCE";
  currentCircleId: string;
  currentDate: string; // ISO string
  currentNotes: string | null;
  circles: Circle[];
  createdBy: string | null;
  facilitatorId: string | null;
  isAdmin: boolean;
}

export function EditMeetingButton({
  meetingId,
  currentType,
  currentCircleId,
  currentDate,
  currentNotes,
  circles,
  createdBy,
  facilitatorId,
  isAdmin,
}: EditMeetingButtonProps) {
  const { personId } = useUser();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCreator = personId === createdBy || personId === facilitatorId;
  const canEdit = isCreator || isAdmin;

  const meetingDate = new Date(currentDate);
  const [circleId, setCircleId] = useState(currentCircleId);
  const [type, setType] = useState(currentType);
  const [date, setDate] = useState(meetingDate.toISOString().split("T")[0]);
  const [time, setTime] = useState(
    `${String(meetingDate.getHours()).padStart(2, "0")}:${String(meetingDate.getMinutes()).padStart(2, "0")}`
  );
  const [notes, setNotes] = useState(currentNotes || "");

  if (!canEdit) return null;

  const handleOpenEdit = () => {
    const d = new Date(currentDate);
    setCircleId(currentCircleId);
    setType(currentType);
    setDate(d.toISOString().split("T")[0]);
    setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setNotes(currentNotes || "");
    setError(null);
    setEditOpen(true);
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

    const dateTime = new Date(`${date}T${time}:00`);

    const result = await updateMeeting({
      id: meetingId,
      type,
      circleId,
      date: dateTime.toISOString(),
      notes: notes.trim() || null,
    });

    if (result.error) {
      setError(
        result.error === "unauthorized"
          ? "Du hast keine Berechtigung, diesen Termin zu bearbeiten."
          : result.error === "only_scheduled"
            ? "Nur geplante Termine können bearbeitet werden."
            : "Fehler beim Speichern der Änderungen."
      );
      setIsSubmitting(false);
      return;
    }

    setEditOpen(false);
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleOpenEdit}
        className="w-full h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Termin bearbeiten
      </Button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termin bearbeiten</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Circle Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Kreis <span className="text-destructive">*</span>
              </label>
              <Select value={circleId} onValueChange={setCircleId}>
                <SelectTrigger className="h-12 rounded-xl w-full">
                  <SelectValue placeholder="Kreis wählen" />
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
              <label className="text-sm font-medium text-foreground">Termin-Typ</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("TACTICAL")}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
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
                </button>
                <button
                  type="button"
                  onClick={() => setType("GOVERNANCE")}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
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
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-date" className="text-sm font-medium text-foreground">
                  Datum <span className="text-destructive">*</span>
                </label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-time" className="text-sm font-medium text-foreground">
                  Uhrzeit
                </label>
                <Input
                  id="edit-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="edit-notes" className="text-sm font-medium text-foreground">
                Notizen
              </label>
              <Textarea
                id="edit-notes"
                placeholder="Themen, Vorbereitung, Hinweise... (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={5000}
                className="min-h-[80px] rounded-xl resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="flex-1 h-11 rounded-xl"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl"
              >
                {isSubmitting ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
