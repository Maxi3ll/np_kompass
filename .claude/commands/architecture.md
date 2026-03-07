# Architecture & Patterns — np-kompass

## Overview

Next.js 16 App Router application with Supabase backend. Server Components for data fetching, Server Actions for mutations, Supabase Realtime for live features.

## Data Flow

```
Browser → Server Component (fetch via queries.ts)
       → Server Action (mutate via actions.ts) → revalidatePath()
       → Realtime subscription (live meetings via useMeetingRealtime)
```

### Read Path
Server Components call functions from `src/lib/supabase/queries.ts`:
```typescript
// Example: queries.ts
export async function getMeetingById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('meetings').select('*, ...').eq('id', id).single();
  return data;
}
```

### Write Path
Client components call Server Actions from `src/lib/supabase/actions.ts`:
```typescript
// Example: actions.ts
'use server'
export async function createTension(data: CreateTensionData) {
  await requireAuthAs(data.raisedBy);
  const supabase = await createClient();
  // ... insert + revalidatePath()
}
```

### Revalidation
- `revalidatePath()` after mutations to refresh Server Components
- ISR with 30-60s revalidation intervals on pages

## Supabase Client Tiers

| Client | File | Purpose | RLS |
|--------|------|---------|-----|
| Browser | `client.ts` | Client-side subscriptions, auth | Yes |
| Server | `server.ts` | Server Components + Server Actions | Yes |
| Service | `service.ts` | Admin operations, auth linking | **Bypasses** |

## Layout Architecture

### AppShell Pattern
All authenticated pages are wrapped in `<AppShell>`:

```tsx
// AppShell is an async Server Component
<AppShell>              // Fetches user data, provides UserContext
  <Sidebar />           // Desktop only (lg+), w-64
  <main>
    <Header title="..." />
    <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
      {children}
    </div>
  </main>
  <BottomNav />         // Mobile only
</AppShell>
```

### Pages WITHOUT AppShell
- `/login` — Standalone auth page
- `/auth/callback` — API route
- `/auth/confirm` — Standalone OTP page
- `/passwort-aendern?reset=true` — Password reset flow

### Responsive Breakpoints
- **Mobile** (< 1024px): Bottom nav with expandable FAB, full-width content
- **Desktop** (lg+ >= 1024px): Fixed sidebar, constrained content width
- Touch targets: minimum 48px on mobile

## Component Patterns

### Server Component Pages
```typescript
// page.tsx (Server Component)
export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await getMeetingById(id);
  const isAdmin = await isCurrentUserAdmin();
  return <ClientComponent meeting={meeting} isAdmin={isAdmin} />;
}
```

### Client Component with Server Action
```typescript
'use client'
function CreateForm() {
  const [isPending, startTransition] = useTransition();
  const handleSubmit = () => {
    startTransition(async () => {
      await createTension(data);
    });
  };
}
```

### Dialog Modal Pattern
Forms typically use dialog modals:
```typescript
const [open, setOpen] = useState(false);
// ...
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild><Button>Neu</Button></DialogTrigger>
  <DialogContent>
    {/* Form with Server Action on submit */}
  </DialogContent>
</Dialog>
```

## Realtime Architecture (Live Meetings)

### useMeetingRealtime Hook
Location: `src/hooks/use-meeting-realtime.ts`

- Uses `useReducer` for state management
- Subscribes to 5 Supabase `postgres_changes` channels
- Handles INSERT, UPDATE, DELETE events with deduplication
- Auto-cleanup on unmount, auto-reconnection on failure

### State Shape
```typescript
interface LiveMeetingState {
  meeting: Meeting;
  attendees: MeetingAttendee[];
  agendaItems: MeetingAgendaItem[];
  roundEntries: MeetingRoundEntry[];
  agendaComments: MeetingAgendaComment[];
}
```

## Notification System

- Created server-side only (via service-role client, RLS blocks client INSERT)
- Triggers embedded in Server Actions (role changes, tension events, projekt events)
- Bell icon in header with lazy-loaded dropdown
- Unread count fetched in AppShell and passed via UserContext

## Type System

All domain types in `src/types/index.ts`:
- Core: `Person`, `Circle`, `Role`, `RoleAssignment`
- Features: `Tension`, `TensionComment`, `Projekt`, `Subtask`, `SubtaskComment`
- Meetings: `Meeting`, `MeetingAgendaItem`, `MeetingRoundEntry`, `MeetingAgendaComment`
- Auth: `Family`, `Notification`
- Enums: `MeetingPhase`, `MeetingStatus`
- UI Config: `MEETING_STATUS_CONFIG`, `MEETING_PHASE_CONFIG`, `PROJEKT_STATUS_CONFIG`, `CIRCLE_ICONS`

## Key Patterns Summary

| Pattern | Implementation |
|---------|---------------|
| Data fetching | Server Components + `queries.ts` |
| Mutations | Server Actions + `actions.ts` + `revalidatePath()` |
| Auth verification | `requireAuth()` / `requireAuthAs()` in every action |
| Admin bypass | `createServiceClient()` (service-role, no RLS) |
| Real-time | Supabase subscriptions + `useReducer` |
| Layout | `AppShell` Server Component → `UserProvider` context |
| Forms | Dialog modals + `useTransition` + Server Actions |
| Styling | Tailwind utilities + `cn()` + shadcn/ui |
| Icons | `lucide-react` package |
| Language | German throughout UI |
