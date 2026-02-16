'use client';

import { useEffect, useReducer, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { MeetingPhase, MeetingStatus } from '@/types';

// ============ State Types ============

interface Attendee {
  id: string;
  name: string;
  email?: string;
  avatar_color?: string;
}

interface AgendaComment {
  id: string;
  agenda_item_id: string;
  person_id: string;
  content: string;
  created_at: string;
  person?: { id: string; name: string; avatar_color?: string };
}

interface AgendaItem {
  id: string;
  meeting_id: string;
  tension_id: string | null;
  position: number;
  notes: string | null;
  is_processed: boolean;
  outcome: string | null;
  owner_id: string | null;
  created_at: string;
  tension?: { id: string; title: string; status: string; priority: string } | null;
  owner?: { id: string; name: string } | null;
  comments: AgendaComment[];
}

interface RoundEntry {
  id: string;
  meeting_id: string;
  person_id: string;
  phase: 'CHECK_IN' | 'CLOSING';
  content: string;
  created_at: string;
  updated_at: string;
  person?: { id: string; name: string; avatar_color?: string };
}

export interface LiveMeetingState {
  status: MeetingStatus;
  currentPhase: MeetingPhase | null;
  currentAgendaPosition: number | null;
  attendees: Attendee[];
  agendaItems: AgendaItem[];
  checkIns: RoundEntry[];
  closings: RoundEntry[];
  protocol: string | null;
}

// ============ Reducer Actions ============

type MeetingAction =
  | { type: 'INIT'; payload: LiveMeetingState }
  | { type: 'MEETING_UPDATE'; payload: Record<string, any> }
  | { type: 'ATTENDEE_INSERT'; payload: Attendee }
  | { type: 'ATTENDEE_DELETE'; payload: { id: string } }
  | { type: 'AGENDA_UPDATE'; payload: Record<string, any> }
  | { type: 'AGENDA_INSERT'; payload: AgendaItem }
  | { type: 'AGENDA_DELETE'; payload: { id: string } }
  | { type: 'ROUND_ENTRY_UPSERT'; payload: RoundEntry }
  | { type: 'COMMENT_INSERT'; payload: AgendaComment };

function meetingReducer(state: LiveMeetingState, action: MeetingAction): LiveMeetingState {
  switch (action.type) {
    case 'INIT':
      return action.payload;

    case 'MEETING_UPDATE': {
      const p = action.payload;
      // Handle null values explicitly (when COMPLETED, current_phase is set to null)
      return {
        ...state,
        status: p.status ?? state.status,
        currentPhase: p.status === 'COMPLETED' ? null : (p.current_phase !== undefined ? p.current_phase : state.currentPhase),
        currentAgendaPosition: p.status === 'COMPLETED' ? null : (p.current_agenda_position !== undefined ? p.current_agenda_position : state.currentAgendaPosition),
        protocol: p.protocol !== undefined ? p.protocol : state.protocol,
      };
    }

    case 'ATTENDEE_INSERT': {
      if (state.attendees.some(a => a.id === action.payload.id)) return state;
      return { ...state, attendees: [...state.attendees, action.payload] };
    }

    case 'ATTENDEE_DELETE':
      return { ...state, attendees: state.attendees.filter(a => a.id !== action.payload.id) };

    case 'AGENDA_UPDATE': {
      const updated = action.payload;
      return {
        ...state,
        agendaItems: state.agendaItems.map(item =>
          item.id === updated.id
            ? {
                ...item,
                is_processed: updated.is_processed ?? item.is_processed,
                outcome: updated.outcome !== undefined ? updated.outcome : item.outcome,
                notes: updated.notes !== undefined ? updated.notes : item.notes,
                position: updated.position ?? item.position,
              }
            : item
        ),
      };
    }

    case 'AGENDA_INSERT': {
      if (state.agendaItems.some(i => i.id === action.payload.id)) return state;
      const items = [...state.agendaItems, { ...action.payload, comments: action.payload.comments || [] }];
      items.sort((a, b) => a.position - b.position);
      return { ...state, agendaItems: items };
    }

    case 'AGENDA_DELETE':
      return { ...state, agendaItems: state.agendaItems.filter(i => i.id !== action.payload.id) };

    case 'ROUND_ENTRY_UPSERT': {
      const entry = action.payload;
      const target = entry.phase === 'CHECK_IN' ? 'checkIns' : 'closings';
      const existing = state[target];
      const existingIndex = existing.findIndex(
        e => e.person_id === entry.person_id && e.phase === entry.phase
      );

      let updated;
      if (existingIndex >= 0) {
        updated = [...existing];
        updated[existingIndex] = entry;
      } else {
        updated = [...existing, entry];
      }

      return { ...state, [target]: updated };
    }

    case 'COMMENT_INSERT': {
      const comment = action.payload;
      // Deduplicate: don't add if already present
      return {
        ...state,
        agendaItems: state.agendaItems.map(item =>
          item.id === comment.agenda_item_id && !item.comments.some(c => c.id === comment.id)
            ? { ...item, comments: [...item.comments, comment] }
            : item
        ),
      };
    }

    default:
      return state;
  }
}

// ============ Hook ============

export function useMeetingRealtime(meetingId: string, initialData: LiveMeetingState) {
  const [state, dispatch] = useReducer(meetingReducer, initialData);
  const router = useRouter();

  // Keep a ref of agendaItemIds for the comment subscription (avoids stale closure)
  const agendaItemIdsRef = useRef<Set<string>>(new Set(initialData.agendaItems.map(i => i.id)));
  useEffect(() => {
    agendaItemIdsRef.current = new Set(state.agendaItems.map(i => i.id));
  }, [state.agendaItems]);

  // Re-init when meetingId changes (page navigation)
  useEffect(() => {
    dispatch({ type: 'INIT', payload: initialData });
  }, [meetingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // When status transitions to COMPLETED, reload the page to show protocol from server
  useEffect(() => {
    if (state.status === 'COMPLETED') {
      const timer = setTimeout(() => {
        router.refresh();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.status, router]);

  const fetchAttendee = useCallback(async (personId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('persons')
      .select('id, name, email, avatar_color')
      .eq('id', personId)
      .single();
    return data;
  }, []);

  const fetchCommentWithPerson = useCallback(async (commentId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('meeting_agenda_comments')
      .select('*, person:persons(id, name, avatar_color)')
      .eq('id', commentId)
      .single();
    return data;
  }, []);

  const fetchRoundEntryWithPerson = useCallback(async (entryId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('meeting_round_entries')
      .select('*, person:persons(id, name, avatar_color)')
      .eq('id', entryId)
      .single();
    return data;
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`live-meeting-${meetingId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'meetings', filter: `id=eq.${meetingId}` },
        (payload) => {
          dispatch({ type: 'MEETING_UPDATE', payload: payload.new });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'meeting_attendees', filter: `meeting_id=eq.${meetingId}` },
        async (payload) => {
          const person = await fetchAttendee(payload.new.person_id);
          if (person) {
            dispatch({ type: 'ATTENDEE_INSERT', payload: person });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'meeting_attendees', filter: `meeting_id=eq.${meetingId}` },
        (payload) => {
          dispatch({ type: 'ATTENDEE_DELETE', payload: { id: payload.old.person_id } });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'meeting_agenda_items', filter: `meeting_id=eq.${meetingId}` },
        (payload) => {
          dispatch({ type: 'AGENDA_UPDATE', payload: payload.new });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'meeting_agenda_items', filter: `meeting_id=eq.${meetingId}` },
        (payload) => {
          dispatch({ type: 'AGENDA_INSERT', payload: payload.new as any });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'meeting_agenda_items', filter: `meeting_id=eq.${meetingId}` },
        (payload) => {
          dispatch({ type: 'AGENDA_DELETE', payload: { id: payload.old.id } });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meeting_round_entries', filter: `meeting_id=eq.${meetingId}` },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const entry = await fetchRoundEntryWithPerson(payload.new.id);
            if (entry) {
              dispatch({ type: 'ROUND_ENTRY_UPSERT', payload: entry });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'meeting_agenda_comments' },
        async (payload) => {
          // Use ref to avoid stale closure — always has current agenda item IDs
          const agendaItemId = payload.new.agenda_item_id;
          if (agendaItemIdsRef.current.has(agendaItemId)) {
            const comment = await fetchCommentWithPerson(payload.new.id);
            if (comment) {
              dispatch({ type: 'COMMENT_INSERT', payload: comment });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, fetchAttendee, fetchCommentWithPerson, fetchRoundEntryWithPerson]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
