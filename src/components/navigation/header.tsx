"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/supabase/actions";
import { useUser } from "@/components/layout/user-context";
import { NotificationBell } from "./notification-bell";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function Header({
  title = "Kompass",
  showBack,
  backHref = "/",
}: HeaderProps) {
  const { name: userName, email: userEmail, avatarColor } = useUser();
  const initials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="flex h-16 items-center justify-between px-4 max-w-2xl mx-auto lg:max-w-none lg:px-8">
        <div className="flex items-center gap-3">
          {showBack ? (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-primary/10 active:bg-primary/20 transition-colors touch-target"
              aria-label="Zurück"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          ) : (
            <div className="flex items-center gap-2 lg:hidden">
              {/* Neckarpiraten Logo/Icon - hidden on desktop (shown in sidebar) */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--np-blue)] to-[var(--np-blue-dark)] flex items-center justify-center shadow-sm">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  {/* Compass/Anchor hybrid icon */}
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {!showBack && (
              <p className="text-xs text-muted-foreground -mt-0.5 lg:hidden">Neckarpiraten e.V.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <NotificationBell />

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full touch-target flex items-center justify-center"
              aria-label="Benutzermenü öffnen"
            >
              <Avatar className="h-10 w-10 ring-2 ring-[var(--np-yellow)]/30 ring-offset-2 ring-offset-background transition-all hover:ring-[var(--np-yellow)]/60">
                <AvatarFallback
                  className="text-white text-sm font-semibold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
            <div className="px-3 py-2 border-b border-border/50">
              <p className="text-sm font-medium">{userName}</p>
              {userEmail && <p className="text-xs text-muted-foreground truncate mt-0.5">{userEmail}</p>}
            </div>
            <div className="p-1">
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/profil" className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mein Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/profil" className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Meine Rollen
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="p-1">
              <DropdownMenuItem
                onClick={() => signOut()}
                className="rounded-lg cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Abmelden
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
