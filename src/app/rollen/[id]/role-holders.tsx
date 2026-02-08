"use client";

import { useState } from "react";
import Link from "next/link";

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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </a>
        )}
        {holder.phone && (
          <a
            href={`tel:${holder.phone}`}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#9a7b00] hover:bg-[var(--np-yellow)]/15 transition-colors"
            title={`${holder.name} anrufen`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
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
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b45309"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--np-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
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
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
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
