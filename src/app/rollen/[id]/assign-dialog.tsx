"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignRole } from "@/lib/supabase/actions";

interface Person {
  id: string;
  name: string;
  email: string;
}

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  persons: Person[];
}

export function AssignDialog({ open, onOpenChange, roleId, persons }: AssignDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [personId, setPersonId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAssign = () => {
    if (!personId) {
      setError("Bitte wähle eine Person aus");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await assignRole(roleId, personId);
      if (result.error) {
        setError(result.error === "unauthorized" ? "Keine Berechtigung" : result.error);
        return;
      }
      onOpenChange(false);
      setPersonId("");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Person zuweisen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {persons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Personen verfügbar. Bitte erst Mitglieder über die Profil-Seite (E-Mail-Allowlist) hinzufügen.
            </p>
          ) : (
            <Select value={personId} onValueChange={setPersonId}>
              <SelectTrigger className="h-12 rounded-xl w-full">
                <SelectValue placeholder="Person auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {persons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div>
                      <span className="font-medium">{person.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{person.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Abbrechen
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isPending || !personId}
            className="rounded-xl"
          >
            {isPending ? "Zuweisen..." : "Zuweisen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
