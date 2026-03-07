# Auth & Session Management — np-kompass

## Overview

Authentication uses Supabase Auth (email + password). Access is restricted to an email allowlist. A proxy checks auth + allowlist on every request.

## Auth Flow

### 1. Login (`/login`)
- Server Component checks if already authenticated → redirects to `/`
- Three modes in `LoginForm` (client component):
  - **Login**: `signInWithPassword()` → redirect to `/`
  - **Registrieren** ("Konto aktivieren"): `signUpWithPassword()` with client-side password rules (8+ chars, upper, lower, digit, special). Email must be on allowlist. Auto-confirms email via service-role client. Auto-links auth user to `persons` record.
  - **Passwort vergessen**: `resetPassword()` sends reset email. Non-revealing success message regardless of email existence.

### 2. Auth Callback (`/auth/callback`)
GET route handler:
1. Extracts `code` + `next` params
2. Open redirect prevention: `next` must start with `/` and not `//`
3. Exchanges code for session
4. Checks email against allowlist → signs out if not allowed
5. Auto-links auth user to `persons` record via service-role client

### 3. Auth Confirm (`/auth/confirm`)
Client-side OTP verification page:
1. Reads `token_hash` + `type` (EmailOtpType) from search params
2. Calls `supabase.auth.verifyOtp()`
3. Recovery type → redirects to `/passwort-aendern?reset=true`
4. Other types → redirects to `next` param (default `/`)

### 4. Password Change (`/passwort-aendern`)
Two layouts:
- **Reset flow** (`?reset=true`): Standalone layout without AppShell
- **Normal flow** (from profile): Wrapped in AppShell with back-link

Client-side validation: 8+ chars, uppercase, lowercase, digit, special char. Calls `updatePassword()` server action.

## Proxy (`src/proxy.ts`)

Runs on every request (except static files, images, `_next/*`).

**Public routes** (no auth required):
- `/login`
- `/auth/callback`
- `/auth/confirm`

**Flow:**
1. Refreshes Supabase session via cookies
2. `supabase.auth.getUser()` to verify session
3. Unauthenticated → redirect to `/login`
4. Authenticated → check email against allowlist
5. Not on allowlist → sign out + redirect to `/login?error=access_denied`
6. On `/login` while authenticated → redirect to `/`

### Allowlist Check (`isEmailAllowedCheck`)
Three-tier check:
1. Admin email (first in `ALLOWED_EMAILS` env) → always allowed
2. `allowed_emails` DB table (via service-role client)
3. Fallback: full `ALLOWED_EMAILS` env variable (for initial setup)

## Server Action Auth Helpers

```typescript
// Returns { userId, email, personId } or throws
async function requireAuth()

// Verifies claimedPersonId matches session, or throws
async function requireAuthAs(claimedPersonId: string)
```

Used by all server actions that accept personId from the client. Prevents identity spoofing.

## UserContext Provider

`AppShell` (async Server Component) fetches user data server-side:
1. Gets auth user via `supabase.auth.getUser()`
2. Queries `persons` table for name, avatar_color
3. Fetches unread notification count
4. Passes to `UserProvider` context

```typescript
interface UserData {
  name: string;
  email: string;
  avatarColor: string;
  personId: string | null;
  unreadNotifications: number;
}
```

Available to client components via `useUser()` hook.

## Account Deletion (`deleteAccount()`)

GDPR-aware cascading cleanup:
1. Ends active role assignments (`valid_until = today`)
2. Anonymizes tensions, projekte, subtasks, meetings (sets person references to null)
3. Deletes: notifications, subtask volunteers, tension comments, person record, allowlist entry
4. Deletes Supabase auth user via service-role admin API
5. Redirects to `/login`

## Key Files

- `src/proxy.ts` — Middleware proxy
- `src/app/login/` — Login page + form
- `src/app/auth/callback/route.ts` — Auth callback
- `src/app/auth/confirm/page.tsx` — OTP verification
- `src/app/passwort-aendern/` — Password change
- `src/components/layout/user-context.tsx` — UserContext provider
- `src/components/layout/app-shell.tsx` — Server-side user data fetching
- `src/lib/supabase/actions.ts` — Auth helpers (`requireAuth`, `requireAuthAs`, `signInWithPassword`, etc.)
