import type { ReactNode } from "react";
import Link from "next/link";
import type { NotificationType } from "@/types";

interface RoleInfo {
  id: string;
  name: string;
  circle?: string;
  color?: string;
}

interface NotificationInfo {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface RightPanelProps {
  myRoles: RoleInfo[];
  recentNotifications: NotificationInfo[];
  nextMeeting?: {
    circle?: { name?: string };
  } | null;
  openTensions: number;
}

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "ROLE_ASSIGNED":
    case "ROLE_UNASSIGNED":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case "TENSION_CREATED":
    case "TENSION_ASSIGNED":
    case "TENSION_RESOLVED":
    case "TENSION_COMMENTED":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "PROJEKT_CREATED":
    case "PROJEKT_VOLUNTEER":
    case "PROJEKT_SUBTASK_COMPLETED":
    case "PROJEKT_COMMENTED":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
  }
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function getPiratenTipp(nextMeeting: RightPanelProps["nextMeeting"], openTensions: number): { text: string; icon: ReactNode } {
  if (nextMeeting?.circle?.name) {
    return {
      text: `Nächstes ${nextMeeting.circle.name}-Meeting: Bereite deine Punkte vor!`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    };
  }

  if (openTensions > 3) {
    return {
      text: `Es gibt ${openTensions} offene Spannungen. Schau mal ob du helfen kannst!`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    };
  }

  return {
    text: "Dein Engagement bewegt das Schiff! Danke, dass du dabei bist.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  };
}

export function RightPanel({ myRoles, recentNotifications, nextMeeting, openTensions }: RightPanelProps) {
  const tipp = getPiratenTipp(nextMeeting, openTensions);

  return (
    <aside className="hidden xl:flex xl:flex-col gap-4 w-72 shrink-0">
      {/* Aktivität */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--np-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          Aktivität
        </h3>

        {recentNotifications.length > 0 ? (
          <ul className="space-y-2.5">
            {recentNotifications.map((n) => (
              <li key={n.id} className="flex items-start gap-2.5 group">
                <div className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                  n.is_read ? "bg-muted text-muted-foreground" : "bg-[var(--np-blue-light)] text-[var(--np-blue)]"
                }`}>
                  {notificationIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs leading-snug line-clamp-2 ${
                    n.is_read ? "text-muted-foreground" : "text-foreground"
                  }`}>
                    {n.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(n.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">
            Keine neuen Aktivitäten
          </p>
        )}
      </div>

      {/* Deine Rollen */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--np-yellow-light)] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--np-yellow-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          Deine Rollen
        </h3>

        {myRoles.length > 0 ? (
          <ul className="space-y-2">
            {myRoles.map((role) => (
              <li key={role.id}>
                <Link
                  href={`/rollen/${role.id}`}
                  className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: role.color || "var(--np-blue)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">
                      {role.name}
                    </p>
                    {role.circle && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {role.circle}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">
            Noch keine Rollen zugewiesen
          </p>
        )}
      </div>

      {/* Piraten-Tipp */}
      <div className="bg-gradient-to-br from-[var(--np-blue-pale)] to-[var(--np-yellow-pale)] rounded-2xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <span className="text-base">🦜</span>
          Piraten-Tipp
        </h3>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-muted-foreground shrink-0">
            {tipp.icon}
          </span>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {tipp.text}
          </p>
        </div>
      </div>
    </aside>
  );
}
