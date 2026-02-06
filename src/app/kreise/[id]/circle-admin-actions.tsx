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
import { deleteCircle } from "@/lib/supabase/actions";
import { CircleFormDialog } from "../circle-form-dialog";
import { RoleFormDialog } from "../../rollen/role-form-dialog";

interface CircleAdminActionsProps {
  circle: {
    id: string;
    name: string;
    purpose?: string | null;
    color?: string | null;
    icon?: string | null;
  };
  hasRoles: boolean;
}

export function CircleAdminActions({ circle, hasRoles }: CircleAdminActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteCircle(circle.id);
      if (result.error) {
        if (result.error === "has_roles") {
          setDeleteError("Kreis hat noch Rollen. Bitte erst alle Rollen löschen.");
        } else {
          setDeleteError(result.error);
        }
        return;
      }
      router.push("/kreise");
      router.refresh();
    });
  };

  return (
    <>
      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setEditOpen(true)}
          className="flex-1 h-10 rounded-xl text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Bearbeiten
        </Button>
        <Button
          variant="outline"
          onClick={() => setAddRoleOpen(true)}
          className="flex-1 h-10 rounded-xl text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Rolle hinzufügen
        </Button>
      </div>

      {!hasRoles && (
        <Button
          variant="outline"
          onClick={() => setDeleteOpen(true)}
          className="w-full h-10 rounded-xl text-sm text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 mt-2"
        >
          Kreis löschen
        </Button>
      )}

      {/* Edit Dialog */}
      <CircleFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        circle={circle}
      />

      {/* Add Role Dialog */}
      <RoleFormDialog
        open={addRoleOpen}
        onOpenChange={setAddRoleOpen}
        mode="create"
        circleId={circle.id}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kreis löschen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Möchtest du den Kreis &quot;{circle.name}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          {deleteError && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl"
            >
              {isPending ? "Löschen..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
