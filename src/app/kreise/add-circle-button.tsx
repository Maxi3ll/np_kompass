"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircleFormDialog } from "./circle-form-dialog";

interface AddCircleButtonProps {
  parentCircleId?: string;
}

export function AddCircleButton({ parentCircleId }: AddCircleButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="w-full h-12 rounded-lg mt-4"
      >
        <Plus size={16} className="mr-2" />
        Kreis hinzufügen
      </Button>

      <CircleFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        parentCircleId={parentCircleId}
      />
    </>
  );
}
