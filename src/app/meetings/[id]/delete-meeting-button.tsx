"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/layout/user-context";
import { deleteMeeting } from "@/lib/supabase/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface DeleteMeetingButtonProps {
  meetingId: string;
  circleName: string;
  createdBy: string | null;
  facilitatorId: string | null;
  isAdmin: boolean;
}

export function DeleteMeetingButton({ meetingId, circleName, createdBy, facilitatorId, isAdmin }: DeleteMeetingButtonProps) {
  const { personId } = useUser();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCreator = personId === createdBy || personId === facilitatorId;
  const canDelete = isCreator || isAdmin;

  if (!canDelete) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await deleteMeeting(meetingId);

    if (result.error) {
      setError(
        result.error === "unauthorized"
          ? "Du hast keine Berechtigung, diesen Termin zu löschen."
          : result.error === "only_scheduled"
            ? "Nur geplante Termine können gelöscht werden."
            : "Fehler beim Löschen des Termins."
      );
      setIsSubmitting(false);
      return;
    }

    router.push("/meetings");
    router.refresh();
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setDeleteOpen(true)}
        className="w-full h-10 rounded-xl text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 size={16} className="mr-2" />
        Termin löschen
      </Button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Termin löschen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Der Termin für &ldquo;{circleName}&rdquo; und alle zugehörigen Agenda-Punkte werden unwiderruflich gelöscht.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
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
