import { Skeleton } from "@/components/ui/skeleton";

export default function AufgabenLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-28" />
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* Filter Bar Skeleton */}
        <div className="px-5 pt-4 pb-3 max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Tasks List Skeleton */}
        <div className="px-5 max-w-2xl mx-auto space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            </div>
          ))}
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
