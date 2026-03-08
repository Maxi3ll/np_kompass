'use client';

export function CheckInPhase() {
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">👋</span>
        <h3 className="font-semibold text-foreground">Check-in Runde</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Wie geht es dir? Teilt euch kurz mit, was euch gerade beschäftigt — einfach offen in der Runde besprechen.
      </p>
    </div>
  );
}
