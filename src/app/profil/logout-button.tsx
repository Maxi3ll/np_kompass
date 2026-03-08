"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase/actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full h-12 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Wird abgemeldet...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <LogOut size={18} />
          Abmelden
        </span>
      )}
    </Button>
  );
}
