# NP-Kompass

Governance-Tool for **Neckarpiraten e.V.**, a Stuttgart-based parent-child initiative. Built with a Holacracy-light model to help ~40 families organize their circles, roles, and tensions.

## Features

- **Kreise** (Circles) - Organizational units with interactive SVG circle-packing visualization (GlassFrog-style), drill-down navigation, and stats
- **Rollen** (Roles) - Role definitions with domains, accountabilities, and multiple holders per role
- **Spannungen** (Tensions) - Issue tracking with status, priority, and circle assignment
- **Meetings** - Tactical and governance meeting planning
- **Suche** - Global search across circles, roles, tensions, and persons
- **Benachrichtigungen** - In-app notifications + Telegram group messages (with per-user opt-out)
- **Profil** - User profile with editable name, avatar color, Telegram toggle, data export (DSGVO), and account deletion
- **Admin** - Inline admin actions for managing circles, roles, assignments, and email allowlist
- **Impressum & Datenschutz** - Legal notice and privacy policy pages

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) with React 19 and TypeScript 5
- [Supabase](https://supabase.com/) for PostgreSQL, authentication (email + password), and RLS
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
├── app/            # Pages (kreise, rollen, spannungen, meetings, suche, profil, impressum, datenschutz, login)
├── components/
│   ├── layout/     # AppShell, UserContext
│   ├── navigation/ # Header, Sidebar, BottomNav, NotificationBell
│   └── ui/         # shadcn/ui components
├── lib/
│   ├── supabase/   # Client, server, service client, queries, actions
│   ├── circle-packing.ts  # Circle-packing layout algorithm for SVG visualization
│   └── telegram.ts # Telegram bot notification helper
└── types/          # TypeScript domain types
```

## Database

Migrations are in `supabase/migrations/` (8 migrations). Key tables: `circles`, `roles`, `role_assignments`, `tensions`, `persons`, `families`, `allowed_emails`, `notifications`.

The database contains the real Neckarpiraten organizational structure: 10 circles and 43 roles with purposes, domains, and accountabilities. Roles support multiple simultaneous holders. Users can opt out of Telegram notifications individually.

## License

Private - Neckarpiraten e.V.
