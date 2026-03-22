-- Migration 019: Add new fields to roles and circles tables
-- Roles: not_accountable_for, interfaces, guidelines, artifacts
-- Circles: accountabilities, domains

-- =====================================================
-- ADD NEW COLUMNS TO ROLES
-- =====================================================

ALTER TABLE public.roles
  ADD COLUMN IF NOT EXISTS not_accountable_for TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interfaces TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS guidelines TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS artifacts TEXT[] DEFAULT '{}';

-- =====================================================
-- ADD NEW COLUMNS TO CIRCLES
-- =====================================================

ALTER TABLE public.circles
  ADD COLUMN IF NOT EXISTS accountabilities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS domains TEXT[] DEFAULT '{}';

-- =====================================================
-- RECREATE current_role_holders VIEW WITH NEW COLUMNS
-- =====================================================

DROP VIEW IF EXISTS public.current_role_holders;
CREATE VIEW public.current_role_holders
WITH (security_invoker = true)
AS
SELECT
  r.id AS role_id,
  r.name AS role_name,
  r.purpose AS role_purpose,
  r.domains,
  r.accountabilities,
  r.not_accountable_for,
  r.interfaces,
  r.guidelines,
  r.artifacts,
  r.circle_id,
  c.name AS circle_name,
  ra.id AS assignment_id,
  ra.person_id AS holder_id,
  p.name AS holder_name,
  p.email AS holder_email,
  p.phone AS holder_phone,
  ra.valid_from AS holder_since
FROM roles r
LEFT JOIN role_assignments ra ON r.id = ra.role_id AND ra.valid_until IS NULL
LEFT JOIN persons p ON ra.person_id = p.id
LEFT JOIN circles c ON r.circle_id = c.id;
