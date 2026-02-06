import { Skeleton } from "@/components/ui/skeleton";

export default function SpannungDetailLoading() {
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
        {/* Status Header Skeleton */}
        <div className="px-5 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        <div className="px-5 max-w-2xl mx-auto mt-4 space-y-4">
          {/* Title & Description Skeleton */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Circle Info Skeleton */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          </div>

          {/* Raised By Skeleton */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
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
