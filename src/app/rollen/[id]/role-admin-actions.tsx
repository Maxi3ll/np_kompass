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
import { deleteRole, unassignRole } from "@/lib/supabase/actions";
import { RoleFormDialog } from "../role-form-dialog";
import { AssignDialog } from "./assign-dialog";
import { Pencil, UserPlus, UserX } from "lucide-react";

interface Person {
  id: string;
  name: string;
  email: string;
}

interface Holder {
  id: string;
  name: string;
}

interface RoleAdminActionsProps {
  role: {
    id: string;
    name: string;
    purpose?: string | null;
    domains?: string[];
    accountabilities?: string[];
  };
  holders: Holder[];
  circleId: string;
  persons: Person[];
}

export function RoleAdminActions({ role, holders, circleId, persons }: RoleAdminActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [unassignOpen, setUnassignOpen] = useState(false);
  const [selectedUnassignPersonId, setSelectedUnassignPersonId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteRole(role.id);
      if (result.error) {
        if (result.error === "has_active_assignment") {
          setError("Rolle ist noch besetzt. Bitte erst alle Zuweisungen beenden.");
        } else {
          setError(result.error);
        }
        return;
      }
      router.push(`/kreise/${circleId}`);
      router.refresh();
    });
  };

  const handleUnassign = () => {
    const personId = holders.length === 1 ? holders[0].id : selectedUnassignPersonId;
    if (!personId) {
      setError("Bitte wähle eine Person aus");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await unassignRole(role.id, personId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setUnassignOpen(false);
      setSelectedUnassignPersonId("");
      router.refresh();
    });
  };

  const currentHolderIds = holders.map(h => h.id);

  return (
    <>
      {/* Admin action buttons */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Admin</h2>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="h-10 rounded-lg text-sm"
          >
            <Pencil size={14} className="mr-1.5" />
            Bearbeiten
          </Button>

          <Button
            variant="outline"
            onClick={() => setAssignOpen(true)}
            className="h-10 rounded-lg text-sm"
          >
            <UserPlus size={14} className="mr-1.5" />
            Person zuweisen
          </Button>

          {holders.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setUnassignOpen(true)}
              className="h-10 rounded-lg text-sm"
            >
              <UserX size={14} className="mr-1.5" />
              Zuweisung beenden
            </Button>
          )}

          {holders.length === 0 && (
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="h-10 rounded-lg text-sm text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              Löschen
            </Button>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <RoleFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        role={{
          id: role.id,
          name: role.name,
          purpose: role.purpose,
          domains: role.domains,
          accountabilities: role.accountabilities,
        }}
      />

      {/* Assign Dialog */}
      <AssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        roleId={role.id}
        persons={persons}
        currentHolderIds={currentHolderIds}
      />

      {/* Unassign Dialog */}
      <Dialog open={unassignOpen} onOpenChange={setUnassignOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Zuweisung beenden</DialogTitle>
          </DialogHeader>

          {holders.length === 1 ? (
            <p className="text-sm text-muted-foreground">
              Möchtest du die Zuweisung von <span className="font-medium text-foreground">{holders[0].name}</span> für &quot;{role.name}&quot; beenden?
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Wähle die Person, deren Zuweisung beendet werden soll:
              </p>
              <Select value={selectedUnassignPersonId} onValueChange={setSelectedUnassignPersonId}>
                <SelectTrigger className="h-12 rounded-lg w-full">
                  <SelectValue placeholder="Person auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {holders.map((holder) => (
                    <SelectItem key={holder.id} value={holder.id}>
                      {holder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUnassignOpen(false)} className="rounded-lg">
              Abbrechen
            </Button>
            <Button
              onClick={handleUnassign}
              disabled={isPending || (holders.length > 1 && !selectedUnassignPersonId)}
              className="rounded-lg"
            >
              {isPending ? "Beenden..." : "Zuweisung beenden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rolle löschen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Möchtest du die Rolle &quot;{role.name}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-lg">
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="rounded-lg">
              {isPending ? "Löschen..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
