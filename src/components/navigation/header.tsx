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
import { ChevronLeft, Search, User, Users, LogOut } from "lucide-react";

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
              <ChevronLeft size={20} strokeWidth={2.5} className="text-foreground" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 lg:hidden">
              {/* Neckarpiraten Logo/Icon - hidden on desktop (shown in sidebar) */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--np-blue)] to-[var(--np-blue-dark)] flex items-center justify-center shadow-sm">
                <span className="text-lg leading-none">🧭</span>
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
          <Link
            href="/suche"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 active:bg-primary/20 transition-colors touch-target"
            aria-label="Suche"
          >
            <Search size={20} className="text-muted-foreground" />
          </Link>
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
          <DropdownMenuContent align="end" className="w-56 rounded-lg shadow-lg">
            <div className="px-3 py-2 border-b border-border/50">
              <p className="text-sm font-medium">{userName}</p>
              {userEmail && <p className="text-xs text-muted-foreground truncate mt-0.5">{userEmail}</p>}
            </div>
            <div className="p-1">
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/profil" className="flex items-center gap-2">
                  <User size={16} />
                  Mein Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/profil" className="flex items-center gap-2">
                  <Users size={16} />
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
                <LogOut size={16} />
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
