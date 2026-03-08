'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Archive, CircleCheck, User, MessageSquare, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  NEW: { label: 'Neu', color: 'bg-[var(--status-new)]', textColor: 'text-white' },
  IN_PROGRESS: { label: 'In Bearbeitung', color: 'bg-[var(--status-in-progress)]', textColor: 'text-[#5a4a00]' },
  RESOLVED: { label: 'Erledigt', color: 'bg-[var(--status-resolved)]', textColor: 'text-white' },
  ESCALATED: { label: 'Eskaliert', color: 'bg-[var(--status-escalated)]', textColor: 'text-white' },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Niedrig', icon: '○' },
  MEDIUM: { label: 'Mittel', icon: '◐' },
  HIGH: { label: 'Hoch', icon: '●' },
};

const PAGE_SIZE = 7;

interface TensionsListProps {
  tensions: any[];
  currentPersonId: string | null;
  isArchive: boolean;
  statusFilter?: string;
}

export function TensionsList({ tensions, currentPersonId, isArchive, statusFilter }: TensionsListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sort: assigned to current user first, then by created_at (already sorted from query)
  const sorted = useMemo(() => {
    if (!currentPersonId) return tensions;
    return [...tensions].sort((a, b) => {
      const aAssigned = a.assigned_to === currentPersonId ? 1 : 0;
      const bAssigned = b.assigned_to === currentPersonId ? 1 : 0;
      if (aAssigned !== bAssigned) return bAssigned - aAssigned;
      return 0; // preserve existing order (created_at desc from query)
    });
  }, [tensions, currentPersonId]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[var(--status-resolved)]/20 flex items-center justify-center mx-auto mb-4">
          {isArchive ? (
            <Archive size={32} color="var(--status-resolved)" />
          ) : (
            <CircleCheck size={32} color="var(--status-resolved)" />
          )}
        </div>
        <p className="font-medium text-foreground">
          {isArchive ? 'Archiv ist leer' : 'Keine Spannungen'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isArchive
            ? 'Noch keine erledigten Spannungen.'
            : statusFilter
              ? 'Keine Spannungen mit diesem Status.'
              : 'Alles erledigt!'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 stagger-fade-in">
        {visible.map((tension: any) => {
          const status = STATUS_CONFIG[tension.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NEW;
          const priority = PRIORITY_CONFIG[tension.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;
          const isAssignedToMe = currentPersonId && tension.assigned_to === currentPersonId;

          return (
            <Link key={tension.id} href={`/spannungen/${tension.id}`} className="block">
              <div className={`bg-card rounded-2xl shadow-card border p-4 transition-all card-lift active:scale-[0.98] ${
                isAssignedToMe ? 'border-primary/40' : 'border-border/50'
              }`}>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {tension.title}
                    </h3>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.textColor}`}>
                    {status.label}
                  </span>
                </div>

                {/* Description */}
                {tension.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {tension.description}
                  </p>
                )}

                {/* Meta Row */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50 flex-wrap">
                  {/* Circle */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tension.circle?.color || '#4A90D9' }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {tension.circle?.name}
                    </span>
                  </div>

                  {/* Assigned Person */}
                  {tension.assigned_to_person?.name && (
                    <div className={`flex items-center gap-1 text-xs ${
                      isAssignedToMe ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}>
                      <User size={12} />
                      <span>{isAssignedToMe ? 'Dir zugewiesen' : tension.assigned_to_person.name}</span>
                    </div>
                  )}

                  {/* Priority */}
                  <div className={`flex items-center gap-1 text-xs ${
                    tension.priority === 'HIGH' ? 'text-[var(--status-escalated)]' : 'text-muted-foreground'
                  }`}>
                    <span>{priority.icon}</span>
                    <span>{priority.label}</span>
                  </div>

                  {/* Comments */}
                  {tension.comment_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare size={12} />
                      <span>{tension.comment_count}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <Clock size={12} />
                    <span>
                      {new Date(tension.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all active:scale-[0.97]"
          >
            Mehr laden ({sorted.length - visibleCount} weitere)
          </button>
        </div>
      )}
    </>
  );
}
