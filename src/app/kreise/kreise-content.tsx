"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleVisualization } from "./circle-visualization";
import { AddCircleButton } from "./add-circle-button";

interface KreiseContentProps {
  circles: {
    id: string;
    name: string;
    purpose?: string | null;
    color?: string | null;
    icon?: string | null;
    parent_circle_id?: string | null;
    role_count?: number;
    open_tensions?: number;
  }[];
  roles: {
    id: string;
    name: string;
    circle_id?: string;
    circle?: { id: string; name: string; color?: string | null; icon?: string | null } | null;
  }[];
  isAdmin: boolean;
}

type ViewMode = 'list' | 'visual';

export function KreiseContent({ circles, roles, isAdmin }: KreiseContentProps) {
  const [view, setView] = useState<ViewMode>('list');
  const anchorCircle = circles.find(c => c.parent_circle_id === null);
  // Show all circles: anchor circle first, then children sorted by name
  const displayCircles = [
    ...(anchorCircle ? [anchorCircle] : []),
    ...circles.filter(c => c.parent_circle_id !== null),
  ];

  return (
    <>
      {/* Page header with toggle */}
      <div className="px-5 pt-2 pb-2 max-w-2xl mx-auto lg:max-w-4xl lg:pt-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Wähle einen Kreis, um die zugehörigen Rollen zu sehen
          </p>

          {/* View toggle - desktop only */}
          <div className="hidden lg:flex items-center bg-muted rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'list'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Liste
            </button>
            <button
              onClick={() => setView('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'visual'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="18" cy="8" r="2" />
              </svg>
              Visuell
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
        {/* Visual mode - desktop only */}
        {view === 'visual' && (
          <div className="hidden lg:block">
            <CircleVisualization circles={circles} roles={roles} />
          </div>
        )}

        {/* List mode (always on mobile, togglable on desktop) */}
        <div className={view === 'visual' ? 'lg:hidden' : ''}>
          <div className="space-y-3 stagger-fade-in">
            {displayCircles.map((circle) => (
              <Link key={circle.id} href={`/kreise/${circle.id}`} className="block">
                <div className="relative overflow-hidden bg-card rounded-2xl shadow-card border border-border/50 transition-all card-lift active:scale-[0.98]">
                  {/* Colored left border */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: circle.color || '#4A90D9' }}
                  />

                  <div className="flex items-center gap-4 p-4 pl-5">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ backgroundColor: `${circle.color}20` || '#4A90D920' }}
                    >
                      {circle.icon || '⭕'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-foreground text-base">
                        {circle.name}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {circle.purpose}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <span>{circle.role_count || 0} Rollen</span>
                        </div>

                        {(circle.open_tensions || 0) > 0 && (
                          <div className={`flex items-center gap-1.5 text-xs ${(circle.open_tensions || 0) > 3 ? 'text-[var(--status-escalated)]' : 'text-muted-foreground'}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{circle.open_tensions} offen</span>
                            {(circle.open_tensions || 0) > 3 && (
                              <span className="w-2 h-2 rounded-full bg-[var(--status-escalated)] pulse-dot" />
                            )}
                          </div>
                        )}

                        {(circle.open_tensions || 0) === 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--status-resolved)]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <span>Alles erledigt</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 text-muted-foreground/50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Admin: Add circle */}
          {isAdmin && (
            <AddCircleButton parentCircleId={anchorCircle?.id} />
          )}

          {/* Info card at bottom */}
          <div className="mt-6 p-4 rounded-2xl bg-[var(--np-blue-pale)] border border-[var(--np-blue)]/10">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--np-blue-light)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--np-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Was sind Kreise?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Kreise sind Gruppen von Rollen mit einem gemeinsamen Zweck. Jeder Kreis hat einen Sprecher, der die Meetings moderiert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
