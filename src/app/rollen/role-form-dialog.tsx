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
import { createRole, updateRole } from "@/lib/supabase/actions";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  circleId?: string;
  role?: {
    id: string;
    name: string;
    purpose?: string | null;
    domains?: string[];
    accountabilities?: string[];
  };
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  circleId,
  role,
}: RoleFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(role?.name || "");
  const [purpose, setPurpose] = useState(role?.purpose || "");
  const [domains, setDomains] = useState<string[]>(role?.domains || []);
  const [accountabilities, setAccountabilities] = useState<string[]>(role?.accountabilities || []);
  const [newDomain, setNewDomain] = useState("");
  const [newAccountability, setNewAccountability] = useState("");

  const addDomain = () => {
    if (newDomain.trim()) {
      setDomains((prev) => [...prev, newDomain.trim()]);
      setNewDomain("");
    }
  };

  const addAccountability = () => {
    if (newAccountability.trim()) {
      setAccountabilities((prev) => [...prev, newAccountability.trim()]);
      setNewAccountability("");
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Bitte gib einen Namen ein");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result =
        mode === "edit" && role
          ? await updateRole(role.id, {
              name: name.trim(),
              purpose: purpose.trim() || undefined,
              domains,
              accountabilities,
            })
          : await createRole({
              name: name.trim(),
              purpose: purpose.trim() || undefined,
              domains,
              accountabilities,
              circleId: circleId!,
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Rolle bearbeiten" : "Neue Rolle"}
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
              placeholder="z.B. Elterndienst-Koordination"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Zweck</label>
            <Textarea
              placeholder="Was soll diese Rolle erreichen?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[60px] rounded-xl resize-none"
            />
          </div>

          {/* Domains */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Domains</label>
            <p className="text-xs text-muted-foreground">Bereiche, über die diese Rolle entscheidet</p>
            {domains.length > 0 && (
              <div className="space-y-1">
                {domains.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-muted/50 text-sm">
                    <span className="flex-1">{d}</span>
                    <button
                      type="button"
                      onClick={() => setDomains((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Neue Domain"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDomain(); } }}
                className="h-9 rounded-xl text-sm"
              />
              <Button type="button" variant="outline" onClick={addDomain} disabled={!newDomain.trim()} className="h-9 rounded-xl px-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Accountabilities */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Aufgaben</label>
            <p className="text-xs text-muted-foreground">Wiederkehrende Tätigkeiten dieser Rolle</p>
            {accountabilities.length > 0 && (
              <div className="space-y-1">
                {accountabilities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-muted/50 text-sm">
                    <span className="flex-1">{a}</span>
                    <button
                      type="button"
                      onClick={() => setAccountabilities((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Neue Aufgabe"
                value={newAccountability}
                onChange={(e) => setNewAccountability(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAccountability(); } }}
                className="h-9 rounded-xl text-sm"
              />
              <Button type="button" variant="outline" onClick={addAccountability} disabled={!newAccountability.trim()} className="h-9 rounded-xl px-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="rounded-xl">
            {isPending ? "Speichern..." : mode === "edit" ? "Speichern" : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
