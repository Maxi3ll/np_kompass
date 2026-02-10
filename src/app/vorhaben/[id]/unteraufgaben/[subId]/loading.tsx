import { Skeleton } from "@/components/ui/skeleton";

export default function SubtaskDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-28" />
        </div>
      </header>

      <div className="h-16 bg-muted" />

      <main className="flex-1 pb-24">
        <div className="px-5 max-w-2xl mx-auto mt-4 space-y-4">
          <Skeleton className="h-4 w-48" />

          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <Skeleton className="h-7 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <Skeleton className="h-3 w-24 mb-3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>

          <Skeleton className="h-12 w-full rounded-xl" />

          <div className="pt-4">
            <Skeleton className="h-5 w-24 mb-3" />
            <Skeleton className="h-12 w-full rounded-xl mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
