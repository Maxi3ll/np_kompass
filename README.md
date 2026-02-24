# NP-Kompass

Governance-Tool for **Neckarpiraten e.V.**, a Stuttgart-based parent-child initiative. Built with a Holacracy-light model to help ~40 families organize their circles, roles, and tensions.

## Features

- **Kreise** (Circles) - Organizational units with interactive SVG circle-packing visualization (GlassFrog-style), drill-down navigation, and stats
- **Rollen** (Roles) - Role definitions with domains, accountabilities, and multiple holders per role
- **Spannungen** (Tensions) - Issue tracking with status, priority, and circle assignment
- **Vorhaben** (Initiatives) - Projects with coordinator, linked circles, subtasks, volunteers ("Ich helfe mit!"), and comments
- **Termine** (Meetings) - Meeting planning with live facilitation: real-time phases (Check-in, Agenda, Closing), facilitator controls, and auto-generated protocols
- **Personen-Profile** - Public person profiles with avatar, roles, contact info, and family
- **Suche** - Global search across circles, roles, tensions, vorhaben, and persons
- **Benachrichtigungen** - In-app notifications + Telegram group messages (with per-user opt-out)
- **Profil** - User profile with editable name, avatar color, Telegram toggle, data export (DSGVO), and account deletion
- **Admin** - Inline admin actions for managing circles, roles, assignments, and email allowlist
- **Impressum & Datenschutz** - Legal notice and privacy policy pages

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) with React 19 and TypeScript 5
- [Supabase](https://supabase.com/) for PostgreSQL, authentication (email + password), real-time subscriptions, and RLS
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) components
- Responsive layout: desktop sidebar + mobile bottom navigation

## Getting Started

### Prerequisites

- Node.js 22+
- A Supabase project

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ALLOWED_EMAILS=admin@example.com
   TELEGRAM_BOT_TOKEN=your-bot-token        # optional
   TELEGRAM_CHAT_ID=your-chat-id            # optional
   ```
4. Push database migrations:
   ```bash
   npx supabase db push
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/            # Pages (kreise, rollen, spannungen, vorhaben, meetings, personen, suche, profil, login)
├── components/
│   ├── layout/     # AppShell, UserContext
│   ├── navigation/ # Header, Sidebar, BottomNav, NotificationBell
│   └── ui/         # shadcn/ui components
├── hooks/          # Custom React hooks (meeting realtime subscriptions)
├── lib/
│   ├── supabase/   # Client, server, service client, queries, actions
│   ├── circle-packing.ts  # Circle-packing layout algorithm
│   └── telegram.ts # Telegram bot notification helper
├── middleware.ts    # Auth + email allowlist middleware
└── types/          # TypeScript domain types
```

## Database

13 migrations in `supabase/migrations/`. Key tables: `circles`, `roles`, `role_assignments`, `tensions`, `vorhaben`, `subtasks`, `meetings`, `meeting_attendees`, `meeting_agenda_items`, `meeting_round_entries`, `persons`, `families`, `allowed_emails`, `notifications`.

The database contains the real Neckarpiraten organizational structure: 10 circles and 43 roles. Roles support multiple simultaneous holders. Meetings support real-time live facilitation with phase-based workflows.

## Security

See `SECURITY_AUDIT.md` for the full security audit. Key measures:
- Row-Level Security on all tables with tightened policies
- Middleware-based email allowlist verification on every request
- Server-side identity verification (`requireAuth`, `requireAuthAs`)
- Security headers (HSTS, X-Frame-Options, CSP, Permissions-Policy)

## License

Private - Neckarpiraten e.V.
