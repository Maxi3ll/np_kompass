import { Sidebar } from "@/components/navigation/sidebar";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { UserProvider } from "./user-context";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/supabase/queries";

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userData = { name: "Benutzer", email: "", avatarColor: "#4A90D9", personId: null as string | null, unreadNotifications: 0 };

  if (user) {
    userData.email = user.email || "";
    userData.name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Benutzer";

    const { data: person } = await supabase
      .from("persons")
      .select("id, name, avatar_color")
      .eq("auth_user_id", user.id)
      .single();

    if (person) {
      userData.personId = person.id;
      userData.name = person.name;
      if (person.avatar_color) userData.avatarColor = person.avatar_color;
      userData.unreadNotifications = await getUnreadNotificationCount(person.id);
    }
  }

  return (
    <UserProvider userData={userData}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:pl-64 min-w-0">
          {children}
          <BottomNav />
        </div>
      </div>
    </UserProvider>
  );
}
