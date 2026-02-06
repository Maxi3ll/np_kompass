import { Skeleton } from "@/components/ui/skeleton";

export default function KreiseLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-20" />
        </div>
      </header>

      <main className="flex-1 pb-24">
        <div className="px-5 pt-6 max-w-2xl mx-auto">
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-6" />

          {/* Circles Grid Skeleton */}
          <div className="grid grid-cols-1 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <Skeleton className="h-1 w-full" />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-20 border-t border-border/50 bg-background/95">
        <div className="flex items-center justify-around h-full max-w-lg mx-auto px-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
