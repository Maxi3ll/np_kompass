# Live Meetings Feature — Detailed Documentation

## Overview

Real-time meeting facilitation with GlassFrog-style phases. Supports the full meeting lifecycle from scheduling to protocol generation.

## Meeting Lifecycle

```
SCHEDULED → ACTIVE (facilitator starts) → COMPLETED (all agenda processed + closing done)
```

### Meeting Status
- `SCHEDULED`: Meeting planned, attendees can be invited, agenda items added
- `ACTIVE`: Meeting in progress, real-time sync enabled, facilitator controls active
- `COMPLETED`: Meeting finished, protocol generated, all agenda items have outcomes

### Meeting Phases (during ACTIVE status)
```
CHECK_IN → AGENDA → CLOSING
```

- **CHECK_IN**: Round-table where each attendee shares a brief statement (unique per person per phase)
- **AGENDA**: Process agenda items one-by-one, each with discussion comments and outcome
- **CLOSING**: Final round-table for closing thoughts

## Database Schema (Migration 012)

### Extended `meetings` table columns:
| Column | Type | Description |
|--------|------|-------------|
| `status` | TEXT CHECK | `SCHEDULED`, `ACTIVE`, `COMPLETED` (default: SCHEDULED) |
| `current_phase` | TEXT CHECK | `CHECK_IN`, `AGENDA`, `CLOSING` (nullable) |
| `current_agenda_position` | INTEGER | Current agenda item being processed |
| `protocol` | TEXT | Auto-generated meeting protocol |
| `started_at` | TIMESTAMPTZ | When meeting was started |
| `completed_at` | TIMESTAMPTZ | When meeting was completed |

### Extended `meeting_agenda_items` columns:
| Column | Type | Description |
|--------|------|-------------|
| `is_processed` | BOOLEAN | Whether agenda item has been processed (default: false) |
| `outcome` | TEXT | Outcome/decision for this agenda item |
| `owner_id` | UUID → persons | Person responsible for follow-up |

### New table: `meeting_round_entries`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `meeting_id` | UUID → meetings | |
| `person_id` | UUID → persons | |
| `phase` | TEXT CHECK | `CHECK_IN` or `CLOSING` |
| `content` | TEXT | The person's round statement |
| `UNIQUE` | | `(meeting_id, person_id, phase)` — one entry per person per phase |

### New table: `meeting_agenda_comments`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `agenda_item_id` | UUID → meeting_agenda_items | |
| `person_id` | UUID → persons | |
| `content` | TEXT | Comment content |

### Realtime
All 5 meeting tables are added to `supabase_realtime` publication:
- `meetings`, `meeting_attendees`, `meeting_agenda_items`, `meeting_round_entries`, `meeting_agenda_comments`

## Component Architecture

```
src/app/meetings/[id]/
├── page.tsx                           # Server component, fetches meeting data
├── live-meeting.tsx                   # Main live meeting orchestrator (useReducer + realtime)
├── components/
│   ├── meeting-phase-bar.tsx          # Phase stepper (CHECK_IN → AGENDA → CLOSING)
│   ├── participant-list.tsx           # Real-time attendee list with avatars
│   ├── facilitator-controls.tsx       # Phase transitions + agenda management (facilitator only)
│   ├── agenda-item-live.tsx           # Live agenda item display with comments + outcome
│   ├── round-entry-input.tsx          # Check-in/Closing text input boxes
│   └── protocol-view.tsx             # Protocol/notes display
└── live-phases/
    ├── check-in-phase.tsx            # Check-in round UI (shows who has spoken)
    ├── agenda-phase.tsx              # Agenda processing with comments + outcomes
    └── closing-phase.tsx             # Closing round UI
```

## Realtime Hook: `useMeetingRealtime`

Location: `src/hooks/use-meeting-realtime.ts` (~350 lines)

### Purpose
Custom React hook managing the full live meeting state via Supabase realtime subscriptions.

### State (useReducer)
```typescript
interface LiveMeetingState {
  meeting: Meeting;
  attendees: MeetingAttendee[];
  agendaItems: MeetingAgendaItem[];
  roundEntries: MeetingRoundEntry[];
  agendaComments: MeetingAgendaComment[];
}
```

### Subscriptions
Listens to postgres_changes on 5 tables:
1. `meetings` — status, phase, position changes
2. `meeting_attendees` — join/leave events
3. `meeting_agenda_items` — processed, outcome updates
4. `meeting_round_entries` — new check-in/closing entries
5. `meeting_agenda_comments` — new comments

### Features
- Deduplication of entries (handles double-delivery from Supabase)
- State merging via reducer actions (INSERT, UPDATE, DELETE per table)
- Auto-cleanup on unmount (removes all subscriptions)
- Auto-reconnection on subscription failure

## Key Types (src/types/index.ts)

```typescript
type MeetingPhase = 'CHECK_IN' | 'AGENDA' | 'CLOSING';
type MeetingStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';

interface MeetingRoundEntry {
  id: string;
  meeting_id: string;
  person_id: string;
  phase: MeetingPhase;
  content: string;
  created_at: string;
  person?: { name: string; avatar_color: string };
}

interface MeetingAgendaComment {
  id: string;
  agenda_item_id: string;
  person_id: string;
  content: string;
  created_at: string;
  person?: { name: string; avatar_color: string };
}

const MEETING_STATUS_CONFIG = { ... }; // Labels and colors per status
const MEETING_PHASE_CONFIG = { ... };  // Labels and icons per phase
```

## Server Actions (in actions.ts)

Meeting-related actions (all use `requireAuth()`):
- `createMeeting(data)` — Create new meeting
- `updateMeeting(id, data)` — Update meeting details, status, phase
- `addAgendaItem(meetingId, item)` — Add agenda item
- `removeAgendaItem(itemId)` — Remove agenda item
- `updateAgendaItem(itemId, data)` — Update processed, outcome, owner
- `addMeetingAttendee(meetingId, personId)` — Self-join meeting
- `removeMeetingAttendee(meetingId, personId)` — Leave meeting
- `addRoundEntry(meetingId, phase, content)` — Submit check-in/closing
- `addAgendaComment(agendaItemId, content)` — Comment on agenda item

## Facilitator Role

- Meeting creator is auto-set as facilitator (`facilitator_id` column)
- Only facilitator (or admin) can:
  - Start/complete meeting (status transitions)
  - Advance phases (CHECK_IN → AGENDA → CLOSING)
  - Manage agenda item order and processing
  - Mark agenda items as processed with outcomes
- All attendees can:
  - Submit their own check-in/closing entries
  - Add comments to agenda items
  - Self-join/leave the meeting
