# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Use `/meetings`, `/security`, `/database`, `/deploy`, `/auth`, `/admin`, or `/architecture` commands for detailed feature documentation.

## Project Overview

np-kompass is a governance tool for Neckarpiraten e.V., a Stuttgart-based parent-child initiative (~40 families). It implements a Holacracy-light model with four core modules:
- **Rollen-Wiki**: Role definitions with domains, accountabilities, and current holders
- **Spannungs-Log**: Tensions/issues that need resolution within circles, with comments
- **Projekte**: Projects with subtasks, volunteers, and comments
- **Termin-Board**: Meetings with live facilitation (real-time phases: Check-in, Agenda, Closing)

Target users are busy parents with mixed technical expertise - the app must be simple and mobile-friendly.

## Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npx supabase db push  # Apply database migrations
```

## Architecture

### Tech Stack
- **Next.js 16** (App Router) with React 19, TypeScript 5
- **Supabase** for PostgreSQL, auth (email + password), real-time subscriptions
- **Tailwind CSS 4** + **shadcn/ui** components
- **OKLch color space** for perceptually uniform colors

### Data Flow Pattern
Server Components fetch data via `src/lib/supabase/queries.ts`. Mutations use Server Actions in `src/lib/supabase/actions.ts` with `revalidatePath()`. Admin actions use service-role client (bypasses RLS). Pages use ISR (30-60s revalidation).

### Security
- **Proxy** (`src/proxy.ts`): Checks auth + email allowlist on every request, redirects unauthorized users
- **Server Actions**: Use `requireAuth()` and `requireAuthAs(personId)` helpers to verify identity (prevents spoofing)
- **Security Headers** in `next.config.ts`: X-Frame-Options, HSTS, X-Content-Type-Options, Permissions-Policy
- **RLS**: Row-level security on all tables, tightened in migrations 011+013
- See `SECURITY_AUDIT.md` for full audit report

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── kreise/             # Circles (list + [id] detail + admin CRUD + SVG visualization)
│   ├── rollen/             # Roles (list + [id] detail + admin CRUD + assign)
│   ├── spannungen/         # Tensions (list + [id] detail + neu)
│   ├── projekte/           # Projects (list + [id] + unteraufgaben/[subId] + neu)
│   ├── meetings/           # Meetings (list + [id] detail + neu + live meeting components)
│   │   └── [id]/           # Meeting detail with live-meeting.tsx + components/ + live-phases/
│   ├── personen/           # Person profiles ([id] with roles, contact, family)
│   ├── suche/              # Global search (client-side, all entities)
│   ├── profil/             # Profile + admin email allowlist
│   ├── passwort-aendern/   # Password change form
│   ├── impressum/          # Legal notice
│   ├── datenschutz/        # Privacy policy
│   ├── login/              # Auth login (no AppShell)
│   ├── auth/callback/      # Auth callback (auto-links person record)
│   └── auth/confirm/       # Auth confirmation (email confirm + password reset)
├── components/
│   ├── dashboard/          # Dashboard widgets (right-panel)
│   ├── layout/             # AppShell, UserContext
│   ├── navigation/         # Header, Sidebar, BottomNav, NotificationBell, KreiseRollenTabs
│   └── ui/                 # shadcn/ui components
├── hooks/
│   └── use-meeting-realtime.ts  # Custom hook: Supabase realtime subscriptions for live meetings
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client (async cookies)
│   │   ├── service.ts      # Service-role client (bypasses RLS)
│   │   ├── queries.ts      # All database query functions
│   │   └── actions.ts      # Server Actions (CRUD, auth, admin, notifications, meetings)
│   ├── circle-packing.ts   # Circle-packing layout algorithm
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
├── proxy.ts                # Auth + email allowlist proxy
└── types/index.ts           # Domain types (Person, Circle, Role, Tension, Meeting, Projekt, etc.)
```

### Layout Architecture
All authenticated pages wrap content in `<AppShell>` (sidebar + bottom-nav + user context).

Pattern for each page:
```tsx
<AppShell>
  <Header title="..." />
  <main className="flex-1 pb-24 lg:pb-8 page-enter">
    <div className="px-5 max-w-2xl mx-auto lg:max-w-4xl">
      {/* content */}
    </div>
  </main>
</AppShell>
```

- **Desktop (lg+)**: Fixed sidebar (w-64) with nav + action buttons
- **Mobile**: Bottom nav with expandable FAB
- Login page and auth callback do NOT use AppShell

### Domain Model (German terms)
- **Kreis** (Circle): Organizational unit with purpose and parent hierarchy
- **Rolle** (Role): Function within a circle (supports multiple holders)
- **Spannung** (Tension): Issue/improvement to be resolved
- **Projekt** (Project): Project with coordinator, circles, subtasks, volunteers, comments
- **Termin** (Meeting): Scheduled or live meeting with phases, agenda, protocol
- **Familie** (Family): Member family unit
- **Person**: Member with auth, avatar color, family link

### Database
PostgreSQL with RLS. Key tables: `circles`, `roles`, `role_assignments`, `tensions`, `tension_comments`, `projekte`, `projekte_circles`, `subtasks`, `subtask_volunteers`, `subtask_comments`, `meetings`, `meeting_attendees`, `meeting_agenda_items`, `meeting_round_entries`, `meeting_agenda_comments`, `persons`, `families`, `allowed_emails`, `notifications`. Views: `current_role_holders`, `circle_stats` (SECURITY INVOKER).

Migrations 001-016 in `supabase/migrations/`. Use `/database` command for full details.

### Auth Flow
1. Login via email + password (min 8 chars, Supabase Auth)
2. Proxy checks email against allowlist on every request
3. Auth callback auto-links user to `persons` record
4. Password reset via "Passwort vergessen?" flow (`/auth/confirm` → `/passwort-aendern`)

### Notifications
- **In-App**: Bell icon in header, lazy-loaded dropdown
- **Triggers**: Role changes, tension events (incl. comments → all circle members), projekt events

### Live Meetings
Real-time meeting facilitation with GlassFrog-style phases. Use `/meetings` command for full details.
- **Lifecycle**: SCHEDULED → ACTIVE → COMPLETED
- **Phases**: CHECK_IN → AGENDA → CLOSING
- **Real-time**: Supabase subscriptions via `useMeetingRealtime` hook
- **Facilitator controls**: Phase transitions, agenda management, protocol

## Admin System

- Admin = first email in `ALLOWED_EMAILS` env variable
- `isCurrentUserAdmin()` in `src/lib/supabase/actions.ts`
- Actions rendered inline on pages (not separate admin area)
- Admin can: manage circles/roles (CRUD), role assignments, email allowlist
- Persons auto-created when adding email+name to allowlist
- All admin writes use `createServiceClient()` to bypass RLS

## UI/Design Conventions

- **Colors**: Blue (#4A90D9) + Yellow (#F5C842), CSS variables
- **Fonts**: Space Grotesk (headings), Inter (body)
- **Responsive**: `lg:` breakpoint (1024px), 48px touch targets on mobile
- **Components**: shadcn/ui from `src/components/ui/`, `lucide-react` icons
- **Styling**: Tailwind utilities + `cn()` helper
- **Forms**: Dialog modals with useState + Server Actions
- **Language**: German throughout the UI

## Key Files

- `SECURITY_AUDIT.md` - Security audit report with fixes
- `SELF_HOSTING.md` - Self-hosting guide (Supabase + Vercel setup)
- `src/lib/supabase/queries.ts` - All database query functions
- `src/lib/supabase/actions.ts` - All Server Actions
- `src/types/index.ts` - Complete TypeScript domain types
- `src/proxy.ts` - Auth + allowlist proxy
- `next.config.ts` - Security headers configuration

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_EMAILS=admin@example.com,user2@example.com
```

`ALLOWED_EMAILS` is comma-separated. First email = admin.
