"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateVorhaben } from "@/lib/supabase/actions";

interface VorhabenActionsProps {
  vorhabenId: string;
  currentStatus: string;
}

export function VorhabenActions({ vorhabenId, currentStatus }: VorhabenActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (status: 'OPEN' | 'IN_PROGRESS' | 'DONE') => {
    setIsSubmitting(true);
    await updateVorhaben({ id: vorhabenId, status });
    router.refresh();
    setIsSubmitting(false);
  };

  if (currentStatus === "DONE") {
    return (
      <Button
        variant="outline"
        onClick={() => handleAction('OPEN')}
        disabled={isSubmitting}
        className="w-full h-10 rounded-xl text-sm"
      >
        Wieder aufmachen
      </Button>
    );
  }

  return (
    <div className="flex gap-3">
      {currentStatus === "OPEN" && (
        <Button
          variant="default"
          onClick={() => handleAction('IN_PROGRESS')}
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-xl"
        >
          {isSubmitting ? "Wird gespeichert..." : "Umsetzen starten"}
        </Button>
      )}

      {currentStatus === "IN_PROGRESS" && (
        <Button
          variant="default"
          onClick={() => handleAction('OPEN')}
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-xl"
        >
          Zurück auf Offen
        </Button>
      )}

      <Button
        onClick={() => handleAction('DONE')}
        disabled={isSubmitting}
        className="flex-1 h-12 rounded-xl bg-[var(--status-resolved)] hover:bg-[var(--status-resolved)]/90 text-white"
      >
        {isSubmitting ? "Wird gespeichert..." : "Abgeschlossen"}
      </Button>
    </div>
  );
}
