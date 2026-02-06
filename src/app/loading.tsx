import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 max-w-2xl mx-auto">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* Hero Skeleton */}
        <div className="px-5 pt-6 pb-8 max-w-2xl mx-auto">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="px-5 max-w-2xl mx-auto space-y-6">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>

          {/* Meeting Card Skeleton */}
          <Skeleton className="h-40 rounded-2xl" />

          {/* Quick Actions Skeleton */}
          <div>
            <Skeleton className="h-4 w-24 mb-3" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-20 border-t border-border/50 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-around h-full max-w-lg mx-auto px-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
