"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Zap, CircleDot, Rocket, Calendar, Plus } from "lucide-react";

const navItems: { href: string; label: string; icon: React.ReactNode; matchAlso?: string }[] = [
  {
    href: "/",
    label: "Home",
    icon: <Home size={22} />,
  },
  {
    href: "/spannungen",
    label: "Spannungen",
    icon: <Zap size={22} />,
  },
  {
    href: "/kreise",
    label: "Kreise",
    matchAlso: "/rollen",
    icon: <CircleDot size={22} />,
  },
  {
    href: "/projekte",
    label: "Projekte",
    icon: <Rocket size={22} />,
  },
  {
    href: "/meetings",
    label: "Termine",
    icon: <Calendar size={22} />,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);

  // Hide FAB on meeting detail pages (live meetings have facilitator controls in that space)
  const isMeetingDetail = /^\/meetings\/[^/]+$/.test(pathname);

  return (
    <>
      {/* Backdrop overlay when FAB is open */}
      {fabOpen && !isMeetingDetail && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Floating Action Button - bottom right, above navbar (hidden on meeting detail pages) */}
      {!isMeetingDetail && (
      <div className="fixed bottom-20 right-4 z-50 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Expanded action options */}
        {fabOpen && (
          <div className="absolute bottom-full mb-3 right-0 flex flex-col items-end gap-3">
            <Link
              href="/meetings/neu"
              onClick={() => setFabOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <Calendar size={16} />
              Termin
            </Link>
            <Link
              href="/spannungen/neu"
              onClick={() => setFabOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--np-yellow)] text-[#5a4a00] font-medium text-sm shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <Zap size={16} />
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
              <Plus size={24} strokeWidth={2.5} />
            </span>
          </div>
        </button>
      </div>
      )}

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
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-lg transition-all touch-target",
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
