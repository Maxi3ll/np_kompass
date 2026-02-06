import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* Filter Tabs Skeleton */}
        <div className="px-5 pt-4 pb-3 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
          </div>
        </div>

        {/* Meetings List Skeleton */}
        <div className="px-5 max-w-2xl mx-auto space-y-6">
          {[...Array(2)].map((_, groupIndex) => (
            <div key={groupIndex}>
              <Skeleton className="h-4 w-40 mb-3" />
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                    <Skeleton className="h-1 w-full" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
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
