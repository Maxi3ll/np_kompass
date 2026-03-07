# Admin System — np-kompass

## Overview

Admin functionality is rendered inline on existing pages (no separate admin area). The admin is determined by the first email in the `ALLOWED_EMAILS` environment variable, plus any person with `role: 'admin'` in the database.

## Admin Detection

### `isCurrentUserAdmin()` (actions.ts)
Two paths to admin status:
1. **Superadmin**: User's email === first email in `ALLOWED_EMAILS` env variable (always true regardless of DB)
2. **DB-based**: User's `persons.role` column === `'admin'` (checked via service-role client)

### `isSuperAdmin()` (actions.ts)
Only checks the env-based condition (first email in `ALLOWED_EMAILS`).

## Admin Capabilities

### Email Allowlist Management (`/profil`)
- **Add email**: `addAllowedEmail(email, firstName?, lastName?)` — adds to `allowed_emails` table, optionally auto-creates a `persons` record with `role: 'member'`
- **Remove email**: `removeAllowedEmail(id)` — deletes from allowlist. Cannot remove the admin email (first in env).
- Displayed as a list on the profile page with add/remove controls

### Circle Management (`/kreise`)
- **Create**: `createCircle(data)` — name, purpose, color, icon, parent_circle_id
- **Update**: `updateCircle(id, data)` — all fields editable
- **Delete**: `deleteCircle(id)` — removes circle and cascading data
- Admin sees inline edit/delete buttons on circle detail pages

### Role Management (`/rollen`)
- **Create**: `createRole(data)` — name, purpose, domains[], accountabilities[], circle_id
- **Update**: `updateRole(id, data)` — all fields except circle
- **Delete**: `deleteRole(id)` — removes role and assignments
- **Assign/Unassign**: Role assignment management with valid_from/valid_until dates
- Admin sees inline management controls on role detail pages

### Meeting Administration
- Admin can act as facilitator on any meeting
- Admin can manage attendees and agenda items regardless of facilitator status

## Service Role Client

All admin writes use `createServiceClient()` from `src/lib/supabase/service.ts`:
- Creates Supabase client with `SUPABASE_SERVICE_ROLE_KEY`
- **Bypasses RLS** completely
- Used for: allowlist management, person auto-creation, auth user management, admin checks

```typescript
import { createServiceClient } from '@/lib/supabase/service';
const serviceClient = createServiceClient();
```

## Admin UI Pattern

Admin controls are conditionally rendered inline:
```tsx
{isAdmin && (
  <Button onClick={handleAdminAction}>Admin Action</Button>
)}
```

The admin check is done server-side in the page component, and the result is passed as a prop to client components.

## Key Files

- `src/lib/supabase/actions.ts` — `isCurrentUserAdmin()`, `isSuperAdmin()`, allowlist management
- `src/lib/supabase/service.ts` — Service-role client factory
- `src/app/profil/` — Admin allowlist management UI
- `src/app/kreise/` — Circle CRUD (admin inline)
- `src/app/rollen/` — Role CRUD + assignment (admin inline)
