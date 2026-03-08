"use client";

import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1 flex items-center justify-center p-5">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <CircleAlert size={40} className="text-red-600" />
              </div>

              <h1 className="text-2xl font-bold mb-2">
                Kritischer Fehler
              </h1>
              <p className="text-gray-600 mb-6">
                Die Anwendung ist auf einen unerwarteten Fehler gestoßen.
              </p>

              <Button
                onClick={reset}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Erneut versuchen
              </Button>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
