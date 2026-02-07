"use client";

import { useState } from "react";
import { toggleTelegramNotifications } from "@/lib/supabase/actions";

interface TelegramToggleProps {
  personId: string;
  initialEnabled: boolean;
}

export function TelegramToggle({ personId, initialEnabled }: TelegramToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    const newValue = !enabled;
    setEnabled(newValue);

    const result = await toggleTelegramNotifications(personId, newValue);
    if (result.error) {
      setEnabled(!newValue); // revert
    }
    setIsUpdating(false);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <span className="text-sm text-foreground">Telegram-Benachrichtigungen</span>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aktivitäten werden in die Telegram-Gruppe gepostet
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
