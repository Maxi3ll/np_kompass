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
import { X, Plus } from "lucide-react";

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
    notAccountableFor?: string[];
    interfaces?: string[];
    guidelines?: string[];
    artifacts?: string[];
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
  const [notAccountableFor, setNotAccountableFor] = useState<string[]>(role?.notAccountableFor || []);
  const [interfaces, setInterfaces] = useState<string[]>(role?.interfaces || []);
  const [guidelines, setGuidelines] = useState<string[]>(role?.guidelines || []);
  const [artifacts, setArtifacts] = useState<string[]>(role?.artifacts || []);
  const [newDomain, setNewDomain] = useState("");
  const [newAccountability, setNewAccountability] = useState("");
  const [newNotAccountableFor, setNewNotAccountableFor] = useState("");
  const [newInterface, setNewInterface] = useState("");
  const [newGuideline, setNewGuideline] = useState("");
  const [newArtifact, setNewArtifact] = useState("");

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

  const addNotAccountableFor = () => {
    if (newNotAccountableFor.trim()) {
      setNotAccountableFor((prev) => [...prev, newNotAccountableFor.trim()]);
      setNewNotAccountableFor("");
    }
  };

  const addInterface = () => {
    if (newInterface.trim()) {
      setInterfaces((prev) => [...prev, newInterface.trim()]);
      setNewInterface("");
    }
  };

  const addGuideline = () => {
    if (newGuideline.trim()) {
      setGuidelines((prev) => [...prev, newGuideline.trim()]);
      setNewGuideline("");
    }
  };

  const addArtifact = () => {
    if (newArtifact.trim()) {
      setArtifacts((prev) => [...prev, newArtifact.trim()]);
      setNewArtifact("");
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
              notAccountableFor,
              interfaces,
              guidelines,
              artifacts,
            })
          : await createRole({
              name: name.trim(),
              purpose: purpose.trim() || undefined,
              domains,
              accountabilities,
              notAccountableFor,
              interfaces,
              guidelines,
              artifacts,
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
              className="h-10 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Zweck</label>
            <Textarea
              placeholder="Was soll diese Rolle erreichen?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[60px] rounded-lg resize-none"
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
                      <X size={14} />
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
                className="h-9 rounded-lg text-sm"
              />
              <Button type="button" variant="outline" onClick={addDomain} disabled={!newDomain.trim()} className="h-9 rounded-lg px-3">
                <Plus size={14} />
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
                      <X size={14} />
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
                className="h-9 rounded-lg text-sm"
              />
              <Button type="button" variant="outline" onClick={addAccountability} disabled={!newAccountability.trim()} className="h-9 rounded-lg px-3">
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Not Accountable For */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nicht-Zuständigkeiten</label>
            <p className="text-xs text-muted-foreground">Bereiche, für die diese Rolle explizit nicht zuständig ist</p>
            {notAccountableFor.length > 0 && (
              <div className="space-y-1">
                {notAccountableFor.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-muted/50 text-sm">
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => setNotAccountableFor((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Neue Nicht-Zuständigkeit"
                value={newNotAccountableFor}
                onChange={(e) => setNewNotAccountableFor(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNotAccountableFor(); } }}
                className="h-9 rounded-lg text-sm"
              />
              <Button type="button" variant="outline" onClick={addNotAccountableFor} disabled={!newNotAccountableFor.trim()} className="h-9 rounded-lg px-3">
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Interfaces */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Schnittstellen</label>
            <p className="text-xs text-muted-foreground">Erwartungen und Abstimmungspunkte mit anderen Rollen</p>
            {interfaces.length > 0 && (
              <div className="space-y-1">
                {interfaces.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-muted/50 text-sm">
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => setInterfaces((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Neue Schnittstelle"
                value={newInterface}
                onChange={(e) => setNewInterface(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterface(); } }}
                className="h-9 rounded-lg text-sm"
              />
              <Button type="button" variant="outline" onClick={addInterface} disabled={!newInterface.trim()} className="h-9 rounded-lg px-3">
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Richtlinien</label>
            <p className="text-xs text-muted-foreground">Regeln und Vorgaben für diese Rolle</p>
            {guidelines.length > 0 && (
              <div className="space-y-1">
                {guidelines.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-muted/50 text-sm">
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => setGuidelines((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Neue Richtlinie"
                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGuideline(); } }}
                className="h-9 rounded-lg text-sm"
              />
              <Button type="button" variant="outline" onClick={addGuideline} disabled={!newGuideline.trim()} className="h-9 rounded-lg px-3">
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Artifacts */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Verwaltete Artefakte</label>
            <p className="text-xs text-muted-foreground">Dokumente und Systeme, die von dieser Rolle gepflegt werden</p>
            {artifacts.length > 0 && (
              <div className="space-y-1">
                {artifacts.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-muted/50 text-sm">
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => setArtifacts((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Neues Artefakt"
                value={newArtifact}
                onChange={(e) => setNewArtifact(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArtifact(); } }}
                className="h-9 rounded-lg text-sm"
              />
              <Button type="button" variant="outline" onClick={addArtifact} disabled={!newArtifact.trim()} className="h-9 rounded-lg px-3">
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="rounded-lg">
            {isPending ? "Speichern..." : mode === "edit" ? "Speichern" : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
