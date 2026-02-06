"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createCircle, updateCircle } from "@/lib/supabase/actions";

const COLORS = [
  { value: "#4A90D9", label: "Blau" },
  { value: "#6EC9A8", label: "Grün" },
  { value: "#F5C842", label: "Gelb" },
  { value: "#E8927C", label: "Koralle" },
  { value: "#A78BFA", label: "Lila" },
  { value: "#F472B6", label: "Pink" },
];

interface CircleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  circle?: {
    id: string;
    name: string;
    purpose?: string | null;
    color?: string | null;
    icon?: string | null;
  };
  parentCircleId?: string;
}

export function CircleFormDialog({
  open,
  onOpenChange,
  mode,
  circle,
  parentCircleId,
}: CircleFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(circle?.name || "");
  const [purpose, setPurpose] = useState(circle?.purpose || "");
  const [color, setColor] = useState(circle?.color || "#4A90D9");
  const [icon, setIcon] = useState(circle?.icon || "⭕");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Bitte gib einen Namen ein");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result =
        mode === "edit" && circle
          ? await updateCircle(circle.id, {
              name: name.trim(),
              purpose: purpose.trim() || undefined,
              color,
              icon: icon.trim() || "⭕",
            })
          : await createCircle({
              name: name.trim(),
              purpose: purpose.trim() || undefined,
              color,
              icon: icon.trim() || "⭕",
              parentCircleId,
            });

      if (result.error) {
        setError(result.error === "unauthorized" ? "Keine Berechtigung" : result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Kreis bearbeiten" : "Neuer Kreis"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="z.B. Betrieb"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Zweck</label>
            <Textarea
              placeholder="Wofür ist dieser Kreis verantwortlich?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[80px] rounded-xl resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Farbe</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-xl transition-all ${
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Icon (Emoji)</label>
            <Input
              placeholder="z.B. 🏠"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="h-10 rounded-xl w-20 text-center text-lg"
              maxLength={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="rounded-xl"
          >
            {isPending ? "Speichern..." : mode === "edit" ? "Speichern" : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
