"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems: { href: string; label: string; icon: React.ReactNode; matchAlso?: string }[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/spannungen",
    label: "Spannungen",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    href: "/kreise",
    label: "Kreise",
    matchAlso: "/rollen",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
      </svg>
    ),
  },
  {
    href: "/vorhaben",
    label: "Vorhaben",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
  {
    href: "/meetings",
    label: "Termine",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      {/* Backdrop overlay when FAB is open */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Floating Action Button - bottom right, above navbar */}
      <div className="fixed bottom-20 right-4 z-50 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Expanded action options */}
        {fabOpen && (
          <div className="absolute bottom-full mb-3 right-0 flex flex-col items-end gap-3">
            <Link
              href="/meetings/neu"
              onClick={() => setFabOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Termin
            </Link>
            <Link
              href="/spannungen/neu"
              onClick={() => setFabOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--np-yellow)] text-[#5a4a00] font-medium text-sm shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Spannung
            </Link>
          </div>
        )}

        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="relative"
          aria-label={fabOpen ? "Menü schließen" : "Neu erstellen"}
          aria-expanded={fabOpen}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-[var(--np-yellow)] blur-lg opacity-40" />
          {/* Button */}
          <div className={cn(
            "relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all active:scale-95",
            "bg-gradient-to-br from-[var(--np-yellow)] to-[var(--np-yellow-dark)]",
            "hover:shadow-xl hover:shadow-[var(--np-yellow)]/30"
          )}>
            <span className={cn(
              "text-[#5a4a00] transition-transform duration-200",
              fabOpen && "rotate-45"
            )}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
          </div>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 bottom-nav-safe lg:hidden">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href)) ||
              (item.matchAlso && pathname.startsWith(item.matchAlso));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setFabOpen(false)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all touch-target",
                  "active:scale-95 active:bg-primary/10",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={cn(
                  "transition-transform",
                  isActive && "scale-110"
                )}>
                  {item.icon}
                </span>
                <span className={cn(
                  "text-[10px] transition-all",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
