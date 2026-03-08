import Link from "next/link";

interface RoleInfo {
  id: string;
  name: string;
  circle?: string;
  color?: string;
}

interface RightPanelProps {
  myRoles: RoleInfo[];
}

export function RightPanel({ myRoles }: RightPanelProps) {
  return (
    <aside className="hidden xl:flex xl:flex-col gap-5 w-72 shrink-0 pt-2">
      {/* Deine Rollen */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
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
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground text-center py-2">
            Noch keine Rollen zugewiesen
          </p>
        )}
      </div>
    </aside>
  );
}
