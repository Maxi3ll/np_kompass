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
            className="h-10 rounded-xl text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Bearbeiten
          </Button>

          <Button
            variant="outline"
            onClick={() => setAssignOpen(true)}
            className="h-10 rounded-xl text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Person zuweisen
          </Button>

          {holders.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setUnassignOpen(true)}
              className="h-10 rounded-xl text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="18" y1="8" x2="23" y2="13" />
                <line x1="23" y1="8" x2="18" y2="13" />
              </svg>
              Zuweisung beenden
            </Button>
          )}

          {holders.length === 0 && (
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="h-10 rounded-xl text-sm text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
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
                <SelectTrigger className="h-12 rounded-xl w-full">
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
            <Button variant="outline" onClick={() => setUnassignOpen(false)} className="rounded-xl">
              Abbrechen
            </Button>
            <Button
              onClick={handleUnassign}
              disabled={isPending || (holders.length > 1 && !selectedUnassignPersonId)}
              className="rounded-xl"
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
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="rounded-xl">
              {isPending ? "Löschen..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
