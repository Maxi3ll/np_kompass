# Database Documentation — np-kompass

## Overview

PostgreSQL via Supabase with Row-Level Security on all tables.
Migrations in `supabase/migrations/`. Apply with `npx supabase db push`.

## Migrations

| # | File | Description |
|---|------|-------------|
| 001 | `001_initial_schema.sql` | Full schema: circles, roles, role_assignments, tensions, meetings, meeting_attendees, meeting_agenda_items, persons, families + RLS + functions + views |
| 002 | `002_seed_data.sql` | Seed data for circles, roles, families |
| 003 | `003_allowed_emails.sql` | `allowed_emails` table for email whitelist |
| 004 | `004_person_avatar_color.sql` | `avatar_color` column on persons |
| 005 | `005_notifications.sql` | `notifications` table with RLS |
| 006 | `006_replace_circles_roles.sql` | Real Neckarpiraten structure: 10 circles, 43 roles |
| 007 | `007_multi_holders.sql` | Allow multiple persons per role (drops old unique constraint) |
| 008 | `008_telegram_optout.sql` | `telegram_notifications` boolean on persons (removed in 016) |
| 009 | `009_tasks.sql` | Old tasks tables (replaced by 010) |
| 010 | `010_vorhaben.sql` | Vorhaben (now projekte), subtasks, volunteers, comments tables; drops old tasks |
| 011 | `011_tighten_rls.sql` | Security: tightens 15 RLS policies (creator/owner enforcement) |
| 012 | `012_live_meetings.sql` | Live meetings: status, phases, round entries, agenda comments, realtime |
| 013 | `013_security_audit_fixes.sql` | Views → SECURITY INVOKER, function search_path fixes, meetings INSERT RLS |
| 014 | `014_tension_comments.sql` | Tension comments table |
| 015 | `015_rename_vorhaben_to_projekte.sql` | Rename vorhaben → projekte (tables, columns, FK constraints, RLS, notification types) |
| 016 | `016_remove_telegram.sql` | Drop `telegram_notifications` column from persons (DSGVO: remove third-party dependency) |

## Tables

### Core Governance
| Table | Key Columns | Notes |
|-------|-------------|-------|
| `circles` | id, name, purpose, color, icon, parent_circle_id | Hierarchical org structure |
| `roles` | id, name, purpose, domains[], accountabilities[], circle_id | Functions within circles |
| `role_assignments` | id, role_id, person_id, valid_from, valid_until | UNIQUE(role_id, person_id, valid_until), supports multiple holders |
| `tensions` | id, title, description, status, priority, circle_id, raised_by, assigned_to | Status: NEW, IN_PROGRESS, RESOLVED |

### Projekte (Projects)
| Table | Key Columns | Notes |
|-------|-------------|-------|
| `projekte` | id, title, description, status, coordinator_id, created_by | Status: OPEN, IN_PROGRESS, DONE |
| `projekte_circles` | projekt_id, circle_id | Many-to-many link |
| `subtasks` | id, projekt_id, title, status, contact_person_id, created_by | Status: OPEN, IN_PROGRESS, DONE |
| `subtask_volunteers` | id, subtask_id, person_id | "Ich helfe mit!" feature |
| `subtask_comments` | id, subtask_id, person_id, content | Comments on subtasks |

### Meetings
| Table | Key Columns | Notes |
|-------|-------------|-------|
| `meetings` | id, title, date, location, circle_id, facilitator_id, status, current_phase | Status: SCHEDULED, ACTIVE, COMPLETED |
| `meeting_attendees` | id, meeting_id, person_id | Participants |
| `meeting_agenda_items` | id, meeting_id, title, position, is_processed, outcome, owner_id | Ordered agenda |
| `meeting_round_entries` | id, meeting_id, person_id, phase, content | UNIQUE(meeting_id, person_id, phase) |
| `meeting_agenda_comments` | id, agenda_item_id, person_id, content | Discussion on agenda items |

### People & Auth
| Table | Key Columns | Notes |
|-------|-------------|-------|
| `persons` | id, name, email, phone, auth_user_id, avatar_color, family_id | Links to Supabase Auth |
| `families` | id, name | Family groupings |
| `allowed_emails` | id, email, name | Allowlist for registration |
| `notifications` | id, person_id, type, title, message, link, is_read | In-app notifications |

## Views
| View | Purpose | Security |
|------|---------|----------|
| `current_role_holders` | All active role assignments with person details | SECURITY INVOKER |
| `circle_stats` | Aggregate stats per circle (role count, open/resolved tensions) | SECURITY INVOKER |

## Functions
| Function | Returns | Security | Purpose |
|----------|---------|----------|---------|
| `get_current_person_id()` | UUID | DEFINER, `search_path=''` | Gets person.id for current auth user (used in RLS) |
| `is_admin_or_vorstand()` | BOOLEAN | DEFINER, `search_path=''` | Checks if current user is admin/vorstand (used in RLS) |
| `update_updated_at_column()` | TRIGGER | `search_path=''` | Auto-updates `updated_at` timestamp |

## Realtime Publication

These tables are in `supabase_realtime` publication (for live meetings):
- `meetings`
- `meeting_attendees`
- `meeting_agenda_items`
- `meeting_round_entries`
- `meeting_agenda_comments`

## RLS Policy Summary

All tables have RLS enabled. General pattern:
- **SELECT**: `TO authenticated USING (true)` — all authenticated users can read
- **INSERT**: `WITH CHECK (creator = get_current_person_id())` — must be yourself
- **UPDATE**: Restricted to creator/owner/coordinator/admin
- **DELETE**: Restricted to own records or admin

Exceptions:
- `notifications`: INSERT/DELETE blocked from client (created by service-role only)
- `meeting_attendees/agenda_items`: Managed by facilitator or admin
- `subtask_volunteers`: Self-only insert/delete

## Notification Types

```
ROLE_ASSIGNED, ROLE_UNASSIGNED,
TENSION_CREATED, TENSION_ASSIGNED, TENSION_RESOLVED,
PROJEKT_CREATED, PROJEKT_VOLUNTEER, PROJEKT_SUBTASK_COMPLETED, PROJEKT_COMMENTED
```
