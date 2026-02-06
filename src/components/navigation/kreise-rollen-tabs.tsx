"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function KreiseRollenTabs() {
  const pathname = usePathname();
  const isKreise = pathname === "/kreise" || (pathname.startsWith("/kreise/"));
  const isRollen = pathname === "/rollen" || (pathname.startsWith("/rollen/"));

  return (
    <div className="px-5 pt-4 pb-2 max-w-2xl mx-auto lg:max-w-4xl lg:hidden">
      <div className="flex gap-2">
        <Link
          href="/kreise"
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all ${
            isKreise
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Kreise
        </Link>
        <Link
          href="/rollen"
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all ${
            isRollen
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Rollen
        </Link>
      </div>
    </div>
  );
}
