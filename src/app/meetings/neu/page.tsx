import { Header } from "@/components/navigation/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getCircles } from "@/lib/supabase/queries";
import { MeetingForm } from "./meeting-form";

export default async function NeueMeetingPage() {
  const circles = await getCircles();

  // Filter out Anker-Kreis (root circle without parent)
  const displayCircles = circles.filter((c: any) => c.parent_circle_id !== null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title="Neues Meeting" showBack backHref="/meetings" />

      <main className="flex-1 pb-24 page-enter">
        <div className="px-5 py-6 max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Meeting planen</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plane ein neues Kreis-Meeting
            </p>
          </div>

          <MeetingForm circles={displayCircles} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
