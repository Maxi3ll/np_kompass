# NP-Kompass

Governance-Tool for **Neckarpiraten e.V.**, a Stuttgart-based parent-child initiative. Built with a Holacracy-light model to help ~40 families organize their circles, roles, and tensions.

## Features

- **Kreise** (Circles) - Organizational units with purpose, roles, and stats
- **Rollen** (Roles) - Role definitions with domains, accountabilities, and current holders
- **Spannungen** (Tensions) - Issue tracking with status, priority, and circle assignment
- **Meetings** - Tactical and governance meeting planning
- **Profil** - User profile with editable name and avatar color
- **Admin** - Inline admin actions for managing circles, roles, assignments, and email allowlist

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) with React 19 and TypeScript 5
- [Supabase](https://supabase.com/) for PostgreSQL, authentication (magic links), and RLS
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
├── app/            # Pages (kreise, rollen, spannungen, meetings, profil, login)
├── components/
│   ├── layout/     # AppShell, UserContext
│   ├── navigation/ # Header, Sidebar, BottomNav
│   └── ui/         # shadcn/ui components
├── lib/supabase/   # Client, server, service client, queries, actions
└── types/          # TypeScript domain types
```

## Database

Migrations are in `supabase/migrations/`. Key tables: `circles`, `roles`, `role_assignments`, `tensions`, `persons`, `families`, `allowed_emails`.

## License

Private - Neckarpiraten e.V.
