# Security Documentation — np-kompass

## Overview

Full security audit completed Feb 2026. See `SECURITY_AUDIT.md` for the complete report.
This document covers the security architecture and patterns for development.

## Security Layers

### 1. Proxy (`src/proxy.ts`)
Every request passes through the proxy that:
- Refreshes Supabase session if expired
- Redirects unauthenticated users to `/login`
- Checks email against allowlist on **every request** (not just login)
- Signs out + redirects users whose email was removed from allowlist
- Redirects logged-in users from `/login` to `/`
- Public routes (whitelist): `/login`, `/auth/callback`

### 2. Server Action Authentication
Two helper functions in `actions.ts`:

```typescript
// Returns { userId, email, personId } or throws
async function requireAuth(): Promise<{ userId: string; email: string; personId: string }>

// Verifies claimedPersonId matches the session, or throws
async function requireAuthAs(claimedPersonId: string): Promise<void>
```

**Applied to all 12+ server actions** that accept a personId from the client:
- `createTension` → `requireAuthAs(raisedBy)`
- `createVorhaben` → `requireAuthAs(createdBy)`
- `createSubtask` → `requireAuthAs(createdBy)`
- `createSubtaskComment` → `requireAuthAs(personId)`
- `volunteerForSubtask` → `requireAuthAs(personId)`
- `unvolunteerFromSubtask` → `requireAuthAs(personId)`
- `updateTension` → `requireAuth()` + ownership check
- `updateVorhaben` → `requireAuth()` + ownership check
- `createMeeting` → `requireAuth()`
- `addAgendaItem` → `requireAuth()`
- `removeAgendaItem` → `requireAuth()`
- `deleteSubtaskComment` → `requireAuth()` + ownership check

### 3. Row-Level Security (RLS)
All 17+ tables have RLS enabled. Key policies tightened in migration 011:

| Table | Policy | Rule |
|-------|--------|------|
| `vorhaben` | UPDATE | creator OR coordinator OR admin only |
| `vorhaben` | INSERT | `created_by = get_current_person_id()` |
| `subtasks` | UPDATE | contact_person OR creator OR vorhaben owner OR admin |
| `subtasks` | INSERT | `created_by = get_current_person_id()` |
| `subtask_volunteers` | INSERT | `person_id = get_current_person_id()` (own only) |
| `subtask_volunteers` | DELETE | `person_id = get_current_person_id()` (own only) |
| `subtask_comments` | INSERT | `person_id = get_current_person_id()` (own only) |
| `meeting_attendees` | ALL | facilitator OR admin (+ self-join INSERT) |
| `meeting_agenda_items` | ALL | facilitator OR admin |
| `notifications` | UPDATE | own notifications only |
| `notifications` | INSERT/DELETE | blocked (`WITH CHECK (false)`) |

### 4. Security Headers (`next.config.ts`)
| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Clickjacking protection |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing prevention |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer data leak prevention |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Device permissions |

### 5. Database Functions (Migration 013)
- Views `current_role_holders` and `circle_stats` use `SECURITY INVOKER` (not DEFINER)
- Functions `get_current_person_id()` and `is_admin_or_vorstand()` use `SET search_path = ''` to prevent search_path hijacking
- Both functions remain `SECURITY DEFINER` (required for RLS policy evaluation)

### 6. Input Validation
Server-side limits in `actions.ts`:
- Titles: `.trim().slice(0, 500)`
- Descriptions: `.trim().slice(0, 10000)`
- Comments: `.trim().slice(0, 5000)`, empty string rejected
- Password: minimum 8 characters (client + server-side)

### 7. Auth Callback Safety
Open redirect prevention in `src/app/auth/callback/route.ts`:
```typescript
const safeNext = (next.startsWith('/') && !next.startsWith('//')) ? next : '/';
```

## Security Patterns for New Features

When adding new server actions:
1. Always use `requireAuth()` or `requireAuthAs(personId)` at the start
2. Never trust personId/userId from client without verification
3. Add appropriate RLS policies for new tables (default to restrictive)
4. Add `TO authenticated` on all policies
5. Validate and trim all text inputs with `.trim().slice(maxLength)`

When adding new tables:
1. Enable RLS: `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
2. Add SELECT policy with `TO authenticated`
3. Add INSERT with `WITH CHECK (creator = get_current_person_id())`
4. Add UPDATE restricting to owner/admin
5. Consider if realtime publication is needed

## Open Items (from SECURITY_AUDIT.md)
- [ ] Set up database backups (Supabase Pro PITR)
- [ ] Review Telegram privacy (names in messages to non-EU servers)
- [ ] Verify HSTS + cookie flags in production
- [ ] Sign DPA/AVV with Supabase and Vercel
- [ ] Enable Leaked Password Protection (requires Pro Plan)
