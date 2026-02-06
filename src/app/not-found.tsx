import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🧭</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Seite nicht gefunden
          </h1>
          <p className="text-muted-foreground mb-6">
            Die gesuchte Seite existiert nicht oder wurde verschoben.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full h-12 rounded-xl">
                Zur Startseite
              </Button>
            </Link>
            <Link href="/spannungen">
              <Button variant="outline" className="w-full h-12 rounded-xl">
                Zu den Spannungen
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
