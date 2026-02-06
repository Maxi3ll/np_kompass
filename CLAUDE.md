# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

np-kompass is a governance tool for Neckarpiraten e.V., a Stuttgart-based parent-child initiative (~40 families). It implements a Holacracy-light model with three core modules:
- **Rollen-Wiki**: Role definitions with domains, accountabilities, and current holders
- **Spannungs-Log**: Tensions/issues that need resolution within circles
- **Meeting-Board**: Tactical and governance meetings (not yet implemented)

Target users are busy parents with mixed technical expertise - the app must be simple and mobile-first.

## Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

Database migrations are in `supabase/migrations/`. Apply with Supabase CLI:
```bash
supabase db push
```

## Architecture

### Tech Stack
- **Next.js 16** (App Router) with React 19, TypeScript 5
- **Supabase** for PostgreSQL, auth (magic links), and real-time
- **Tailwind CSS 4** + **shadcn/ui** components
- **OKLch color space** for perceptually uniform colors

### Data Flow Pattern
Server Components fetch data directly from Supabase using SSR client:
```
Page (Server Component) → src/lib/supabase/queries.ts → Supabase (PostgreSQL + RLS)
```

Pages use ISR with revalidation intervals (30-60s). No REST API - all data access via typed query functions.

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── kreise/             # Circles feature (list + [id] detail)
│   ├── rollen/             # Roles feature ([id] detail only)
│   └── spannungen/         # Tensions feature (list + [id] detail + neu)
├── components/
│   ├── ui/                 # shadcn/ui components (button, card, badge, etc.)
│   └── navigation/         # Header and bottom nav (client components)
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client (async cookies)
│   │   └── queries.ts      # All database query functions
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
└── types/index.ts          # Complete domain types (Person, Circle, Role, Tension, etc.)
```

### Domain Model (German terms)
- **Kreis** (Circle): Organizational unit with purpose and parent hierarchy
- **Rolle** (Role): Function within a circle with domains and accountabilities
- **Spannung** (Tension): Issue/improvement opportunity to be resolved
- **Familie** (Family): Member family unit
- **Person**: Individual member with auth and family relationship

### Database
11 PostgreSQL tables with RLS enabled. Key tables: `circles`, `roles`, `role_assignments`, `tensions`, `persons`, `families`. Two views: `current_role_holders`, `circle_stats`.

Role history maintained via `role_assignments` with `valid_from`/`valid_until` dates.

## UI/Design Conventions

- **Colors**: Neckarpiraten blue (#4A90D9) + yellow (#F5C842), defined as CSS variables
- **Mobile-first**: 48px minimum touch targets, bottom navigation, card-based layouts
- **Components**: Use existing shadcn/ui components from `src/components/ui/`
- **Icons**: Lucide React only
- **Styling**: Tailwind utilities + `cn()` helper for conditional classes

## Current State

~40% complete. Implemented: read-only pages (circles, roles, tensions), navigation, database schema. Missing: authentication flow, create/edit forms, meeting board, real-time updates.

Home page (`src/app/page.tsx`) uses mock data - needs replacement with `getDashboardData()`.

## Key Files

- `NECKARPIRATEN_GOVERNANCE_TOOL_SPEC.md` - Full 1156-line product specification
- `src/lib/supabase/queries.ts` - All database query functions
- `src/types/index.ts` - Complete TypeScript domain types
- `supabase/migrations/001_initial_schema.sql` - Full database schema

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
