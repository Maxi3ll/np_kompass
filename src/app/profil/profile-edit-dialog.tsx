"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/supabase/actions";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  { value: "#4A90D9", label: "Blau" },
  { value: "#F5C842", label: "Gelb" },
  { value: "#4CAF50", label: "Grün" },
  { value: "#E57373", label: "Rot" },
  { value: "#AB47BC", label: "Lila" },
  { value: "#FF8A65", label: "Orange" },
  { value: "#26A69A", label: "Türkis" },
  { value: "#78909C", label: "Grau" },
];

interface ProfileEditDialogProps {
  personId: string;
  currentName: string;
  currentAvatarColor: string | null;
  currentPhone: string | null;
}

export function ProfileEditDialog({
  personId,
  currentName,
  currentAvatarColor,
  currentPhone,
}: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [phone, setPhone] = useState(currentPhone || "");
  const [avatarColor, setAvatarColor] = useState(currentAvatarColor || "#4A90D9");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!name.trim()) {
      setError("Name darf nicht leer sein.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateProfile(personId, {
        name: name.trim(),
        avatar_color: avatarColor,
        phone: phone.trim() || null,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  const initials = name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border-2 border-background shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profil bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white transition-colors"
              style={{ backgroundColor: avatarColor }}
            >
              {initials || "?"}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Telefon</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 123 456789"
            />
            <p className="text-xs text-muted-foreground">Optional. Wird bei deinen Rollen angezeigt.</p>
          </div>

          {/* Avatar Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Avatar-Farbe</label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setAvatarColor(color.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                    avatarColor === color.value
                      ? "bg-muted ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-[11px] text-muted-foreground">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
