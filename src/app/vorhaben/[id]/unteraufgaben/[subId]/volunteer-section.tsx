"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { volunteerForSubtask, unvolunteerFromSubtask } from "@/lib/supabase/actions";

interface Volunteer {
  id: string;
  name: string;
  email?: string;
  avatar_color?: string;
}

interface VolunteerSectionProps {
  subtaskId: string;
  personId: string;
  volunteers: Volunteer[];
  isVolunteer: boolean;
}

export function VolunteerSection({ subtaskId, personId, volunteers, isVolunteer }: VolunteerSectionProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVolunteer = async () => {
    if (!personId) return;
    setIsSubmitting(true);
    await volunteerForSubtask(subtaskId, personId);
    router.refresh();
    setIsSubmitting(false);
  };

  const handleUnvolunteer = async () => {
    if (!personId) return;
    setIsSubmitting(true);
    await unvolunteerFromSubtask(subtaskId, personId);
    router.refresh();
    setIsSubmitting(false);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Helfer:innen ({volunteers.length})
      </h3>

      {/* Volunteer List */}
      {volunteers.length > 0 && (
        <div className="space-y-2 mb-4">
          {volunteers.map((volunteer) => (
            <Link
              key={volunteer.id}
              href={`/personen/${volunteer.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/30 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: volunteer.avatar_color || '#4A90D9' }}
              >
                {volunteer.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{volunteer.name}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {volunteers.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          Noch keine Helfer:innen. Sei die/der Erste!
        </p>
      )}

      {/* Volunteer/Unvolunteer Button */}
      {personId && (
        <>
          {isVolunteer ? (
            <Button
              variant="outline"
              onClick={handleUnvolunteer}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-sm"
            >
              {isSubmitting ? "Wird gespeichert..." : "Nicht mehr helfen"}
            </Button>
          ) : (
            <Button
              onClick={handleVolunteer}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[var(--np-yellow)] hover:bg-[var(--np-yellow)]/90 text-[#5a4a00] font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Wird gespeichert...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  Ich helfe mit!
                </span>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
