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

function getPiratenTipp(nextMeeting: RightPanelProps["nextMeeting"], openTensions: number): string {
  if (nextMeeting?.circle?.name) {
    return `Im nächsten ${nextMeeting.circle.name}-Meeting: Bereite deine Punkte vor!`;
  }
  if (openTensions > 3) {
    return `Es gibt ${openTensions} offene Spannungen. Schau mal ob du helfen kannst!`;
  }
  return "Dein Einsatz bewegt das Schiff!";
}

export function RightPanel({ myRoles, recentNotifications, nextMeeting, openTensions }: RightPanelProps) {
  const tipp = getPiratenTipp(nextMeeting, openTensions);

  return (
    <aside className="hidden xl:flex xl:flex-col gap-5 w-72 shrink-0 pt-2">
      {/* Aktivität */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[var(--status-resolved)]" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Aktivität
          </h3>
        </div>

        <div className="bg-muted/60 rounded-2xl p-4">
          {recentNotifications.length > 0 ? (
            <ul className="space-y-3">
              {recentNotifications.map((n) => (
                <li key={n.id} className="flex items-start gap-2.5">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                    n.is_read ? "bg-muted-foreground/30" : "bg-[var(--np-blue)]"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] leading-snug line-clamp-2 ${
                      n.is_read ? "text-muted-foreground" : "text-foreground"
                    }`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground/70">
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground text-center py-2">
              Keine neuen Aktivitäten
            </p>
          )}
        </div>
      </div>

      {/* Deine Rollen */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Deine Rollen
        </h3>

        {myRoles.length > 0 ? (
          <div className="space-y-2">
            {myRoles.map((role) => (
              <Link
                key={role.id}
                href={`/rollen/${role.id}`}
                className="flex items-center gap-3 bg-muted/60 rounded-xl px-4 py-3 hover:bg-muted transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: role.color || "var(--np-blue)" }}
                />
                <span className="text-[13px] font-medium text-foreground truncate flex-1">
                  {role.name}
                </span>
                {role.circle && (
                  <span className="text-[12px] text-muted-foreground shrink-0">
                    {role.circle}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-muted/60 rounded-xl px-4 py-3">
            <p className="text-[13px] text-muted-foreground text-center">
              Noch keine Rollen zugewiesen
            </p>
          </div>
        )}
      </div>

      {/* Piraten-Tipp */}
      <div className="bg-[var(--np-yellow-pale)] rounded-2xl px-4 py-4">
        <p className="text-[13px] text-foreground/80 leading-relaxed">
          <span className="text-base mr-1.5 align-middle">🦜</span>
          <span className="font-semibold text-foreground">Piraten-Tipp: </span>
          {tipp}
        </p>
      </div>
    </aside>
  );
}
