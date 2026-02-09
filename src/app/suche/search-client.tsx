"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { performSearch } from "@/lib/supabase/actions";

interface SearchResults {
  circles: any[];
  roles: any[];
  tensions: any[];
  persons: any[];
  tasks: any[];
}

const TENSION_STATUS: Record<string, { label: string; class: string }> = {
  NEW: { label: "Neu", class: "badge-new" },
  IN_PROGRESS: { label: "In Bearbeitung", class: "badge-in-progress" },
  RESOLVED: { label: "Erledigt", class: "badge-resolved" },
  ESCALATED: { label: "Eskaliert", class: "badge-escalated" },
};

const TASK_STATUS: Record<string, { label: string; class: string }> = {
  OPEN: { label: "Offen", class: "badge-new" },
  IN_PROGRESS: { label: "In Bearbeitung", class: "badge-in-progress" },
  DONE: { label: "Erledigt", class: "badge-resolved" },
};

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults(null);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const data = await performSearch(query);
      setResults(data);
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const totalResults = results
    ? results.circles.length + results.roles.length + results.tensions.length + results.persons.length + results.tasks.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kreise, Rollen, Spannungen, Aufgaben, Personen..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-card text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading */}
      {isSearching && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* No query yet */}
      {!query && !results && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            Durchsuche Kreise, Rollen, Spannungen, Aufgaben und Personen
          </p>
        </div>
      )}

      {/* No results */}
      {results && !isSearching && totalResults === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Keine Ergebnisse für &bdquo;{query}&ldquo;
          </p>
        </div>
      )}

      {/* Results */}
      {results && !isSearching && totalResults > 0 && (
        <div className="space-y-5">
          {/* Circles */}
          {results.circles.length > 0 && (
            <ResultSection title="Kreise" count={results.circles.length}>
              {results.circles.map((circle) => (
                <Link
                  key={circle.id}
                  href={`/kreise/${circle.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${circle.color}20` }}
                  >
                    {circle.icon || "⭕"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{circle.name}</p>
                    {circle.purpose && (
                      <p className="text-xs text-muted-foreground truncate">{circle.purpose}</p>
                    )}
                  </div>
                </Link>
              ))}
            </ResultSection>
          )}

          {/* Roles */}
          {results.roles.length > 0 && (
            <ResultSection title="Rollen" count={results.roles.length}>
              {results.roles.map((role) => (
                <Link
                  key={role.id}
                  href={`/rollen/${role.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${role.circle?.color || "#4A90D9"}20` }}
                  >
                    {role.circle?.icon || "⭕"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{role.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{role.circle?.name}</p>
                  </div>
                </Link>
              ))}
            </ResultSection>
          )}

          {/* Tensions */}
          {results.tensions.length > 0 && (
            <ResultSection title="Spannungen" count={results.tensions.length}>
              {results.tensions.map((tension) => (
                <Link
                  key={tension.id}
                  href={`/spannungen/${tension.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${tension.circle?.color || "#4A90D9"}20` }}
                  >
                    {tension.circle?.icon || "⚡"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{tension.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TENSION_STATUS[tension.status]?.class || ""}`}>
                        {TENSION_STATUS[tension.status]?.label || tension.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{tension.circle?.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </ResultSection>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <ResultSection title="Aufgaben" count={results.tasks.length}>
              {results.tasks.map((task: any) => (
                <Link
                  key={task.id}
                  href={`/aufgaben/${task.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-[var(--np-blue-light)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--np-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TASK_STATUS[task.status]?.class || ""}`}>
                        {TASK_STATUS[task.status]?.label || task.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </ResultSection>
          )}

          {/* Persons */}
          {results.persons.length > 0 && (
            <ResultSection title="Personen" count={results.persons.length}>
              {results.persons.map((person) => (
                <Link
                  key={person.id}
                  href={`/personen/${person.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
                    style={{ backgroundColor: person.avatar_color || "#4A90D9" }}
                  >
                    {person.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{person.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                  </div>
                </Link>
              ))}
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
