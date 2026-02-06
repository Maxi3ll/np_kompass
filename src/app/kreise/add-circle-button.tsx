"use client";

import { useState } from "react";
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
        className="w-full h-12 rounded-xl mt-4"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
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
