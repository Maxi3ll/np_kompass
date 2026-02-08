# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

np-kompass is a governance tool for Neckarpiraten e.V., a Stuttgart-based parent-child initiative (~40 families). It implements a Holacracy-light model with three core modules:
- **Rollen-Wiki**: Role definitions with domains, accountabilities, and current holders
- **Spannungs-Log**: Tensions/issues that need resolution within circles
- **Meeting-Board**: Tactical and governance meetings

Target users are busy parents with mixed technical expertise - the app must be simple and mobile-friendly.

## Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

Database migrations are in `supabase/migrations/`. Apply with Supabase CLI:
```bash
npx supabase db push
```

## Architecture

### Tech Stack
- **Next.js 16** (App Router) with React 19, TypeScript 5
- **Supabase** for PostgreSQL, auth (email + password), and real-time
- **Tailwind CSS 4** + **shadcn/ui** components
- **OKLch color space** for perceptually uniform colors

### Data Flow Pattern
Server Components fetch data directly from Supabase using SSR client:
```
Page (Server Component) → src/lib/supabase/queries.ts → Supabase (PostgreSQL + RLS)
```

Mutations use Server Actions in `src/lib/supabase/actions.ts` with `revalidatePath()` for cache invalidation. Admin-only actions use the service-role client (bypasses RLS).

Pages use ISR with revalidation intervals (30-60s). No REST API - all data access via typed query functions.

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── kreise/             # Circles feature (list + [id] detail + admin CRUD + SVG visualization)
│   ├── rollen/             # Roles feature (list + [id] detail + admin CRUD + assign)
│   ├── spannungen/         # Tensions feature (list + [id] detail + neu)
│   ├── meetings/           # Meetings feature (list + [id] detail + neu)
│   ├── personen/           # Public person profiles ([id] detail with roles, contact, family)
│   ├── suche/              # Global search (client-side, searches circles/roles/tensions/persons → links to detail pages)
│   ├── profil/             # Profile (edit name/avatar, telegram toggle, data export, delete account) + admin email allowlist
│   ├── impressum/          # Legal notice page
│   ├── datenschutz/        # Privacy policy page
│   ├── login/              # Auth login page (no AppShell)
│   └── auth/callback/      # Auth callback (auto-links person record)
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx   # Layout wrapper (sidebar + bottom-nav + user context)
│   │   └── user-context.tsx # React Context for user data (name, email, avatar color, personId, unreadNotifications)
│   ├── navigation/
│   │   ├── header.tsx      # Sticky header with notification bell + user avatar dropdown
│   │   ├── sidebar.tsx     # Desktop sidebar (lg:, fixed left, w-64)
│   │   ├── bottom-nav.tsx  # Mobile bottom nav with FAB (lg:hidden)
│   │   ├── notification-bell.tsx # Notification bell with unread badge + dropdown
│   │   └── kreise-rollen-tabs.tsx # Mobile tabs to switch Kreise/Rollen
│   └── ui/                 # shadcn/ui components (button, card, dialog, select, avatar, sheet, skeleton, etc.)
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client (async cookies)
│   │   ├── service.ts      # Service-role client (bypasses RLS)
│   │   ├── queries.ts      # All database query functions
│   │   └── actions.ts      # Server Actions (CRUD, auth, admin, notifications)
│   ├── circle-packing.ts   # Circle-packing layout algorithm for GlassFrog-style SVG visualization
│   ├── telegram.ts         # Telegram bot notification helper
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
└── types/index.ts          # Complete domain types (Person, Circle, Role, Tension, etc.)
```

### Layout Architecture
All authenticated pages wrap content in `<AppShell>` which provides:
- **Desktop (lg+)**: Fixed sidebar with navigation (Dashboard, Spannungen, Kreise, Rollen, Meetings, Profil) + action buttons ("Neue Spannung", "Neues Meeting")
- **Mobile**: Bottom navigation (Home, Spannungen, [FAB], Kreise, Meetings) with expandable FAB for creating items
- **User Context**: AppShell fetches user data (name, email, avatar color, personId, unread notification count) from DB and provides via React Context to Header and NotificationBell

The Kreise and Rollen pages share a tab bar on mobile (`KreiseRollenTabs`) for switching between the two views. On desktop, Rollen is a sub-item under Kreise in the sidebar.

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

Login page and auth callback do NOT use AppShell.

### Domain Model (German terms)
- **Kreis** (Circle): Organizational unit with purpose and parent hierarchy
- **Rolle** (Role): Function within a circle with domains and accountabilities (supports multiple holders)
- **Spannung** (Tension): Issue/improvement opportunity to be resolved
- **Familie** (Family): Member family unit
- **Person**: Individual member with auth, avatar color, and family relationship. Public profile at `/personen/[id]` shows roles, contact, and family.

### Database
PostgreSQL tables with RLS enabled. Key tables: `circles`, `roles`, `role_assignments`, `tensions`, `persons`, `families`, `allowed_emails`, `notifications`. Two views: `current_role_holders`, `circle_stats`.

Roles support multiple simultaneous holders. The `role_assignments` table uses a `UNIQUE(role_id, person_id, valid_until)` constraint — the same person can't be assigned twice, but different persons can hold the same role. Role history maintained via `role_assignments` with `valid_from`/`valid_until` dates.

Migrations:
- `001_initial_schema.sql` - Full schema + RLS policies
- `002_seed_data.sql` - Seed data for circles, roles, families
- `003_allowed_emails.sql` - Email allowlist table
- `004_person_avatar_color.sql` - Avatar color column on persons
- `005_notifications.sql` - Notifications table with RLS
- `006_replace_circles_roles.sql` - Real Neckarpiraten circles (10) and roles (43)
- `007_multi_holders.sql` - Allow multiple persons per role (drops old unique constraint)
- `008_telegram_optout.sql` - Telegram notification opt-out preference per person

### Auth Flow
1. User logs in via email + password (Supabase Auth)
2. New users register with email, password, and full name
3. Auth callback (`/auth/callback`) checks email against allowlist
4. Auto-links auth user to `persons` record by matching email
5. Profile page also auto-links on visit (fallback for existing sessions)
6. "Passwort vergessen?" flow for password reset via email

### Notifications
- **In-App**: Notifications stored in `notifications` table, shown via bell icon in header
- **Telegram**: All notifications also sent to a Telegram group via bot API (`src/lib/telegram.ts`)
- **Triggers**: Role assigned/unassigned, tension created/assigned/resolved
- Circle members (persons with active role assignments in a circle) receive tension notifications
- NotificationBell component lazy-loads full list on dropdown open
- **Telegram Opt-Out**: Users can disable Telegram notifications in their profile (`telegram_notifications` column on `persons`)

## Admin System

- Admin is determined by the first email in the `ALLOWED_EMAILS` environment variable
- `isCurrentUserAdmin()` in `src/lib/supabase/actions.ts` checks this
- Admin actions are rendered inline on existing pages (not a separate admin area)
- Admin can: manage circles (CRUD), roles (CRUD), role assignments (multiple holders per role), email allowlist
- Persons are auto-created when an email+name is added to the allowlist
- Email allowlist stored in `allowed_emails` Supabase table with env-variable fallback
- All admin write operations use `createServiceClient()` to bypass RLS

## UI/Design Conventions

- **Colors**: Neckarpiraten blue (#4A90D9) + yellow (#F5C842), defined as CSS variables
- **Fonts**: Space Grotesk (headings), Inter (body)
- **Responsive**: Mobile bottom-nav + desktop sidebar, `lg:` breakpoint (1024px)
- **Touch targets**: 48px minimum on mobile
- **Components**: Use existing shadcn/ui components from `src/components/ui/`
- **Icons**: Inline SVGs (Lucide-style)
- **Styling**: Tailwind utilities + `cn()` helper for conditional classes
- **Forms**: Dialog modals (shadcn/ui Dialog) for create/edit, useState + Server Actions
- **Language**: German throughout the UI
- **Profile**: Users can edit name and avatar color (8 predefined colors), toggle Telegram notifications, export personal data (DSGVO), delete account
- **Circle Visualization**: Interactive SVG with organic circle-packing layout (GlassFrog-style), drill-down navigation, hover tooltips, parent ring navigation
- **Legal Pages**: Impressum and Datenschutz pages linked from profile/footer
- **Global Search**: Client-side search across circles, roles, tensions, and persons (`/suche`) — all results link to detail pages
- **Person Profiles**: Public profile pages (`/personen/[id]`) with avatar, name, family, contact info, and current roles. Linked from search results and role holder lists.

## Key Files

- `NECKARPIRATEN_GOVERNANCE_TOOL_SPEC.md` - Full product specification
- `src/lib/supabase/queries.ts` - All database query functions
- `src/lib/supabase/actions.ts` - All Server Actions (CRUD, auth, admin)
- `src/types/index.ts` - Complete TypeScript domain types
- `supabase/migrations/001_initial_schema.sql` - Full database schema

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_EMAILS=admin@example.com,user2@example.com
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

`ALLOWED_EMAILS` is comma-separated. The first email is the admin.
`TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are optional - if missing, Telegram notifications are silently skipped.
