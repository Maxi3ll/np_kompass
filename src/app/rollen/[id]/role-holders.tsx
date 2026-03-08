"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, CircleAlert, Users, ChevronDown } from "lucide-react";

interface Holder {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  since: string;
  avatar_color?: string;
}

const AVATAR_DEFAULT = "#4A90D9";
const COLLAPSE_THRESHOLD = 4;
const PREVIEW_COUNT = 5; // avatars shown in the stack

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function HolderRow({ holder, compact }: { holder: Holder; compact?: boolean }) {
  const bg = holder.avatar_color || AVATAR_DEFAULT;
  const size = compact ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm";

  return (
    <div className="flex items-center gap-3 py-2.5 group">
      {/* Avatar */}
      <div
        className={`${size} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
        style={{ backgroundColor: bg }}
      >
        {getInitials(holder.name)}
      </div>

      {/* Name + date */}
      <div className="flex-1 min-w-0">
        <Link href={`/personen/${holder.id}`} className="font-semibold text-foreground text-sm truncate block hover:text-primary transition-colors">
          {holder.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          seit {formatDate(holder.since)}
        </p>
      </div>

      {/* Contact icons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {holder.email && (
          <a
            href={`mailto:${holder.email}`}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title={`E-Mail an ${holder.name}`}
          >
            <Mail size={16} />
          </a>
        )}
        {holder.phone && (
          <a
            href={`tel:${holder.phone}`}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#9a7b00] hover:bg-[var(--np-yellow)]/15 transition-colors"
            title={`${holder.name} anrufen`}
          >
            <Phone size={16} />
          </a>
        )}
      </div>
    </div>
  );
}

function AvatarStack({
  holders,
  max,
}: {
  holders: Holder[];
  max: number;
}) {
  const shown = holders.slice(0, max);
  const overflow = holders.length - max;

  return (
    <div className="flex items-center -space-x-2.5">
      {shown.map((h) => (
        <div
          key={h.id}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-card"
          style={{ backgroundColor: h.avatar_color || AVATAR_DEFAULT }}
          title={h.name}
        >
          {getInitials(h.name)}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold bg-muted text-muted-foreground ring-2 ring-card">
          +{overflow}
        </div>
      )}
    </div>
  );
}

export function RoleHolders({ holders }: { holders: Holder[] }) {
  const [expanded, setExpanded] = useState(false);
  const isMany = holders.length >= COLLAPSE_THRESHOLD;

  if (holders.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <CircleAlert size={24} color="#b45309" />
          </div>
          <div>
            <p className="font-semibold text-amber-700">Rolle vakant</p>
            <p className="text-sm text-muted-foreground">
              Diese Rolle ist aktuell nicht besetzt
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Few holders – show them all directly
  if (!isMany) {
    return (
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="px-5 pt-4 pb-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
            <Users size={14} color="var(--np-blue)" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {holders.length === 1
              ? "Rolleninhaber"
              : `${holders.length} Rolleninhaber`}
          </span>
        </div>
        <div className="px-5 pb-3 divide-y divide-border/50">
          {holders.map((holder) => (
            <HolderRow key={holder.id} holder={holder} />
          ))}
        </div>
      </div>
    );
  }

  // Many holders – collapsible
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      {/* Summary header – always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-accent/30 transition-colors active:scale-[0.995]"
      >
        <AvatarStack holders={holders} max={PREVIEW_COUNT} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">
            {holders.length} Rolleninhaber
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {holders
              .slice(0, 3)
              .map((h) => h.name.split(" ")[0])
              .join(", ")}
            {holders.length > 3 && ` und ${holders.length - 3} weitere`}
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded list */}
      {expanded && (
        <div className="border-t border-border/50">
          <div className="px-5 pb-3 max-h-[28rem] overflow-y-auto divide-y divide-border/50">
            {holders.map((holder) => (
              <HolderRow key={holder.id} holder={holder} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
