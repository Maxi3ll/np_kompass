"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Zap, Rocket, Crosshair, Users, Calendar, User } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  sub?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Übersicht",
    icon: <Home size={20} />,
  },
  {
    href: "/spannungen",
    label: "Spannungen",
    icon: <Zap size={20} />,
  },
  {
    href: "/projekte",
    label: "Projekte",
    icon: <Rocket size={20} />,
  },
  {
    href: "/kreise",
    label: "Kreise",
    icon: <Crosshair size={20} />,
  },
  {
    href: "/rollen",
    label: "Rollen",
    sub: true,
    icon: <Users size={18} />,
  },
  {
    href: "/meetings",
    label: "Termine",
    icon: <Calendar size={20} />,
  },
  {
    href: "/profil",
    label: "Profil",
    icon: <User size={20} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--np-blue)] to-[var(--np-blue-dark)] flex items-center justify-center shadow-sm">
          <span className="text-lg leading-none">🧭</span>
        </div>
        <div>
          <h1 className="text-base font-semibold text-sidebar-foreground tracking-tight">
            Kompass
          </h1>
          <p className="text-xs text-muted-foreground -mt-0.5">Neckarpiraten e.V.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
                  item.sub ? "px-3 py-2 pl-10 text-[13px]" : "px-3 py-2.5",
                  isActive
                    ? "bg-sidebar-primary/10 text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : ""
                )}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Action Buttons */}
      <div className="px-3 space-y-2">
        <Link
          href="/spannungen/neu"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[var(--np-yellow)] text-[#5a4a00] font-semibold text-sm transition-all hover:bg-[var(--np-yellow-dark)] active:scale-[0.98] shadow-sm"
        >
          <Zap size={18} strokeWidth={2.5} />
          Neue Spannung
        </Link>
        <Link
          href="/meetings/neu"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm"
        >
          <Calendar size={18} />
          Neuer Termin
        </Link>
      </div>

      {/* Legal Links */}
      <div className="px-4 py-3">
        <div className="flex gap-3 text-[11px] text-muted-foreground/60">
          <Link href="/datenschutz" className="hover:text-muted-foreground transition-colors">Datenschutz</Link>
          <Link href="/impressum" className="hover:text-muted-foreground transition-colors">Impressum</Link>
        </div>
      </div>
    </aside>
  );
}
