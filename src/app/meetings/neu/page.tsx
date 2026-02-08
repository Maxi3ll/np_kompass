import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { getCircles } from "@/lib/supabase/queries";
import { MeetingForm } from "./meeting-form";

export default async function NeueMeetingPage() {
  const circles = await getCircles();

  // Filter out Anker-Kreis (root circle without parent)
  const displayCircles = circles.filter((c: any) => c.parent_circle_id !== null);

  return (
    <AppShell>
      <Header title="Neuer Termin" showBack backHref="/meetings" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 py-6 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Termin planen</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plane einen neuen Kreis-Termin
            </p>
          </div>

          <MeetingForm circles={displayCircles} />
        </div>
      </main>

    </AppShell>
  );
}
