"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/layout/user-context";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/supabase/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppNotification } from "@/types";
import { Bell, Users, CircleAlert, Rocket } from "lucide-react";

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;

  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function getNotificationHref(n: AppNotification): string {
  if (n.projekt_id) return `/projekte/${n.projekt_id}`;
  if (n.tension_id) return `/spannungen/${n.tension_id}`;
  if (n.role_id) return `/rollen/${n.role_id}`;
  return "/";
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "ROLE_ASSIGNED":
    case "ROLE_UNASSIGNED":
      return <Users size={14} className="text-muted-foreground" />;
    case "TENSION_CREATED":
    case "TENSION_ASSIGNED":
    case "TENSION_RESOLVED":
    case "TENSION_COMMENTED":
      return <CircleAlert size={14} className="text-muted-foreground" />;
    case "PROJEKT_CREATED":
    case "PROJEKT_VOLUNTEER":
    case "PROJEKT_SUBTASK_COMPLETED":
    case "PROJEKT_COMMENTED":
      return <Rocket size={14} className="text-muted-foreground" />;
    default:
      return <Bell size={14} className="text-muted-foreground" />;
  }
}

export function NotificationBell() {
  const router = useRouter();
  const { unreadNotifications } = useUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localUnread, setLocalUnread] = useState(unreadNotifications);

  const handleOpen = async (open: boolean) => {
    if (open && !loaded) {
      setLoading(true);
      const data = await fetchNotifications(20);
      setNotifications(data as AppNotification[]);
      setLoaded(true);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setLocalUnread((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setLocalUnread(0);
  };

  const handleClickNotification = async (n: AppNotification) => {
    if (!n.is_read) {
      await handleMarkAsRead(n.id);
    }
    router.push(getNotificationHref(n));
  };

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 active:bg-primary/20 transition-colors touch-target"
          aria-label="Benachrichtigungen"
        >
          <Bell size={20} className="text-foreground" />
          {localUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--np-yellow)] text-[10px] font-bold text-gray-900">
              {localUnread > 9 ? "9+" : localUnread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 rounded-lg shadow-lg max-h-[70vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
          <span className="text-sm font-semibold">Benachrichtigungen</span>
          {localUnread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Alle als gelesen
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Laden...
            </div>
          ) : notifications.length === 0 && loaded ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Keine Benachrichtigungen
            </div>
          ) : (
            <div className="p-1">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 hover:bg-accent transition-colors flex items-start gap-3 ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[var(--np-blue)] shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatRelativeTime(n.created_at)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
