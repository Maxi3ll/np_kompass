# Security Audit Report — np-kompass

**Date**: 16 February 2026  
**Scope**: Full application security review for production deployment  
**Context**: This application stores **private personal data of parents and families** (names, emails, phone numbers, family relationships). DSGVO (GDPR) compliance is mandatory.

---

## Summary of Findings

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| **CRITICAL** | 2 | 2 | 0 |
| **HIGH** | 3 | 3 | 0 |
| **MEDIUM** | 5 | 1 | 4 |
| **LOW** | 4 | 2 | 2 |

---

## CRITICAL Issues (Fixed)

### 1. Identity Spoofing in Server Actions

**Status**: ✅ FIXED  
**Location**: `src/lib/supabase/actions.ts` — 12 server actions  

**Problem**: Server actions like `createTension`, `createVorhaben`, `createSubtask`, `createSubtaskComment`, `volunteerForSubtask`, `updateTension`, `updateVorhaben`, `updateSubtask`, and `deleteSubtaskComment` accepted a `personId` / `raisedBy` / `createdBy` parameter from the client and trusted it blindly. All these actions used `createServiceClient()` which **bypasses RLS entirely**.

**Impact**: Any authenticated user could impersonate any other parent by sending a different `personId`. They could:
- Create tensions/vorhaben as someone else
- Post comments as another person
- Volunteer/unvolunteer other people
- Delete other people's comments

**Fix**: Added two helper functions (`requireAuth()` and `requireAuthAs()`) that verify the JWT session and match the claimed personId against the actual authenticated user. Applied to all 12 affected server actions:
- `createTension` → verifies `raisedBy` matches caller
- `updateTension` → verifies caller is creator, assignee, or admin
- `createMeeting`, `addAgendaItem`, `removeAgendaItem` → verifies authentication
- `createVorhaben` → verifies `createdBy` matches caller
- `updateVorhaben` → verifies caller is creator, coordinator, or admin
- `createSubtask` → verifies `createdBy` matches caller
- `updateSubtask` → verifies authentication
- `volunteerForSubtask` → verifies `personId` matches caller
- `unvolunteerFromSubtask` → verifies `personId` matches caller
- `createSubtaskComment` → verifies `personId` matches caller
- `deleteSubtaskComment` → verifies caller owns comment or is admin

### 2. Open Redirect in Auth Callback

**Status**: ✅ FIXED  
**Location**: `src/app/auth/callback/route.ts`

**Problem**: The `next` query parameter was used directly in `NextResponse.redirect()` without validation:
```typescript
const next = searchParams.get('next') ?? '/';
return NextResponse.redirect(`${origin}${next}`);
```

An attacker could craft a link like `/auth/callback?code=...&next=//evil.com` which would redirect the user to an external site after authentication, potentially stealing session tokens.

**Fix**: Added validation to ensure `next` is a relative path:
```typescript
const safeNext = (next.startsWith('/') && !next.startsWith('//')) ? next : '/';
```

---

## HIGH Issues (Fixed)

### 3. Missing Security Headers

**Status**: ✅ FIXED  
**Location**: `next.config.ts`

**Problem**: The application had zero security headers configured. For a production app handling private data, this exposes users to:
- **Clickjacking**: No `X-Frame-Options` header — attackers could embed the app in an iframe
- **MIME sniffing**: No `X-Content-Type-Options` header
- **Missing HSTS**: No `Strict-Transport-Security` — first visit could be intercepted
- **No Referrer Policy**: Personal data in URLs could leak via referrer headers

**Fix**: Added comprehensive security headers in `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 4. Overly Permissive RLS Policies

**Status**: ✅ FIXED  
**Location**: `supabase/migrations/010_vorhaben.sql` → Fixed in `011_tighten_rls.sql`

**Problem**: Multiple tables had RLS policies that allowed **any authenticated user** to perform write operations on **any row**:

| Table | Policy | Risk |
|-------|--------|------|
| `vorhaben` | `FOR UPDATE USING (true)` | Anyone can edit any initiative |
| `vorhaben` | `FOR INSERT WITH CHECK (true)` | No creator verification |
| `subtasks` | `FOR UPDATE USING (true)` | Anyone can modify any subtask |
| `subtasks` | `FOR INSERT WITH CHECK (true)` | No creator verification |
| `subtask_volunteers` | `FOR INSERT WITH CHECK (true)` | Can volunteer others |
| `subtask_volunteers` | `FOR DELETE USING (true)` | Can remove others' volunteering |
| `subtask_comments` | `FOR INSERT WITH CHECK (true)` | Can comment as anyone |
| `meeting_attendees` | `FOR ALL USING (true)` | Anyone can manage attendees |
| `meeting_agenda_items` | `FOR ALL USING (true)` | Anyone can manage agendas |
| `vorhaben` (SELECT) | No `TO authenticated` | Potentially readable by anon role |

While the server actions use `createServiceClient()` (bypassing RLS), the **anon key is public** in the browser. A tech-savvy user could call the Supabase REST API directly using the anon key and exploit these permissive policies.

**Fix**: Created migration `011_tighten_rls.sql` that:
- Restricts vorhaben updates to creator/coordinator/admin
- Restricts subtask updates to contact person/creator/vorhaben owner
- Enforces `created_by = get_current_person_id()` on all INSERTs
- Restricts volunteer actions to own `person_id`
- Restricts comment insertion to own `person_id`
- Locks meeting attendee/agenda management to facilitator/admin
- Adds `TO authenticated` on all SELECT policies
- Blocks direct notification manipulation from client

### 5. No Input Length Validation

**Status**: ✅ FIXED (partially, in server actions)

Added `.trim().slice()` limits on user-provided text fields:
- Titles: max 500 chars
- Descriptions: max 5,000-10,000 chars
- Comments: max 5,000 chars, empty rejected

---

## MEDIUM Issues (Remaining — Manual Action Needed)

### 6. Supabase Email Confirmation Disabled

**Severity**: MEDIUM  
**Impact**: Account takeover potential

**Problem**: In `signUpWithPassword()`, the `emailRedirectTo` is set to `undefined`, and there's no email confirmation flow. This means:
- An attacker who knows an allowed email can register immediately
- No proof that the person registering actually owns that email

**Recommendation**: Enable Supabase email confirmation in Dashboard:
1. Go to Supabase Dashboard → Authentication → Email
2. Enable "Confirm email"
3. Update `signUpWithPassword` to handle the confirmation flow

### 7. Weak Password Policy

**Status**: ✅ FIXED
**Severity**: MEDIUM
**Impact**: Brute-force vulnerability

**Problem**: The only password validation was `password.length < 6` (client-side only, not enforced server-side). For an app storing private family data:
- 6 characters is too weak
- No complexity requirements
- No server-side enforcement

**Fix**:
1. Increased minimum to 8 characters (client-side in `login-form.tsx`)
2. Added server-side validation in `signUpWithPassword` in `actions.ts`
3. Remaining: Configure Supabase Auth password strength in Dashboard

### 8. Rate Limiting Not Configured

**Severity**: MEDIUM  
**Impact**: Brute-force, spam

**Problem**: No rate limiting on:
- Login attempts (brute-force)
- Password reset requests (email bombing)
- Creating tensions/vorhaben/comments (spam)
- Search queries (resource exhaustion)

**Recommendation**:
1. Enable Supabase's built-in rate limiting in Dashboard
2. Consider adding rate limiting middleware for server actions
3. At minimum, add client-side cooldowns on forms

### 9. Telegram Messages Contain Personal Names

**Severity**: MEDIUM  
**Impact**: Privacy leak to third-party service

**Problem**: Telegram notifications include personal names: `"Max hat eine Spannung erstellt"`. Telegram servers are outside the EU and not DSGVO-compliant for data storage.

The opt-out toggle only controls whether the individual's actions trigger Telegram messages, but their **name still appears in messages triggered by others** (e.g., "Max wurde zur Rolle X zugewiesen" — sent when admin assigns a role, not controlled by Max's preference).

**Recommendation**:
1. Let the Telegram opt-out also suppress the user's name from appearing in Telegram messages
2. Or use anonymized names in Telegram: "Ein Mitglied hat eine Spannung erstellt"
3. Document Telegram data transfer in Datenschutz page (partially done)

### 10. No Supabase Database Backups Documented

**Severity**: MEDIUM  
**Impact**: Data loss risk

**Recommendation**: Before going live:
1. Enable point-in-time recovery (PITR) on Supabase Pro plan
2. Set up automated daily backups
3. Test restore procedure
4. Document backup strategy

---

## LOW Issues (Remaining)

### 11. Verbose Error Messages

**Severity**: LOW  

**Problem**: Database errors are returned directly to the client:
```typescript
return { error: error.message }; // Exposes PostgreSQL error details
```

**Recommendation**: Return generic errors; log details server-side.

### 12. Search Query Not Sanitized

**Severity**: LOW  

**Problem**: In `queries.ts`, the search query is used with `.ilike`:
```typescript
const q = `%${query}%`;
```
While Supabase parameterizes this (preventing SQL injection), special characters like `%` and `_` in the query are not escaped, which could produce unexpected results.

**Recommendation**: Escape ILIKE special characters:
```typescript
const escaped = query.replace(/[%_\\]/g, '\\$&');
const q = `%${escaped}%`;
```

### 13. Admin Email Seed in Migration

**Status**: ✅ FIXED
**Severity**: LOW
**Location**: `supabase/migrations/003_allowed_emails.sql`

**Problem**: The admin email `hello@max-blum.com` was hardcoded in the migration file. If this repository becomes public, the admin identity is exposed.

**Fix**: Removed hardcoded email from migration. Admin email is now only configured via `ALLOWED_EMAILS` env variable at runtime.

### 14. Missing `httpOnly` / `secure` Cookie Flags Documentation

**Severity**: LOW  

Supabase SSR handles cookies via `@supabase/ssr`, which should set `httpOnly` and `secure` flags correctly. Verify this in production by checking cookies in browser DevTools.

---

## What's Already Good ✅

| Area | Assessment |
|------|------------|
| **Authentication** | Supabase Auth with email+password and Google OAuth. Email allowlist enforced in middleware on every request. |
| **Middleware** | Properly checks auth on every route. Redirects unauthenticated users. Checks allowlist on every request (not just login). |
| **RLS Enabled** | All 17 tables have RLS enabled. |
| **Admin Authorization** | All admin actions (`createCircle`, `updateRole`, `assignRole`, etc.) verify `isCurrentUserAdmin()`. |
| **Profile Ownership** | `updateProfile` and `toggleTelegramNotifications` verify `auth_user_id` matches. |
| **Notification Ownership** | `markNotificationAsRead` verifies the notification belongs to the caller. |
| **DSGVO Art. 17** | Account deletion properly anonymizes all related data (tensions, vorhaben, subtasks, meetings) and deletes the auth user. |
| **DSGVO Art. 20** | Data export returns all personal data in structured JSON. |
| **DSGVO Art. 13** | Datenschutz page documents data processing, legal basis, processors (Supabase, Vercel, Telegram). |
| **XSS Protection** | React auto-escapes all rendered content. No `dangerouslySetInnerHTML` usage found. |
| **SQL Injection** | All queries use Supabase's parameterized query builder — no raw SQL. |
| **Secrets in .gitignore** | `.env*` files are properly gitignored. No secrets found in source code. |
| **Service Client Isolation** | `SUPABASE_SERVICE_ROLE_KEY` is server-side only (no `NEXT_PUBLIC_` prefix). |
| **Dependency Surface** | Very few dependencies (13 total), all from reputable sources. |

---

## Checklist Before Going Live

- [x] Identity spoofing in server actions — FIXED
- [x] Open redirect in auth callback — FIXED
- [x] Security headers — FIXED
- [x] Overly permissive RLS policies — FIXED (migration `011_tighten_rls.sql`)
- [x] Input validation on text fields — FIXED
- [x] **Apply migration** `011_tighten_rls.sql` to production — Applied (all migrations through 013 are live)
- [ ] Enable Supabase email confirmation
- [x] Increase password minimum to 8 characters — FIXED (client + server-side)
- [ ] Configure Supabase rate limiting
- [x] Remove admin email from seed migration — FIXED (removed from `003_allowed_emails.sql`)
- [ ] Set up database backups (Supabase Pro PITR)
- [ ] Review Telegram privacy implications with the Verein
- [ ] Verify HSTS and cookie flags in production
- [x] Fill in placeholder addresses in Datenschutz + Impressum pages — FIXED (real data from neckarpiraten.de)
- [ ] Sign DPA/AVV with Supabase and Vercel (links in their dashboards)
- [x] Supabase Linter: Security Definer Views → SECURITY INVOKER (Migration 013)
- [x] Supabase Linter: Function search_path mutable → SET search_path = '' (Migration 013)
- [x] Supabase Linter: Meetings INSERT RLS tightened (Migration 013)
- [ ] Supabase Linter: Enable Leaked Password Protection (Dashboard)

---

## Files Changed in This Audit

| File | Changes |
|------|---------|
| `src/lib/supabase/actions.ts` | Added `requireAuth()` + `requireAuthAs()` helpers; auth verification on 12 server actions; input length validation; server-side password min 8 chars |
| `src/app/auth/callback/route.ts` | Fixed open redirect via `next` parameter validation |
| `src/app/login/login-form.tsx` | Increased password minimum from 6 to 8 characters; handle `password_too_short` error |
| `next.config.ts` | Added 6 security headers |
| `supabase/migrations/003_allowed_emails.sql` | Removed hardcoded admin email |
| `supabase/migrations/011_tighten_rls.sql` | New migration tightening 15 RLS policies |
| `supabase/migrations/013_security_audit_fixes.sql` | Views → SECURITY INVOKER, functions search_path fixed, meetings INSERT RLS tightened |
