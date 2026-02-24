-- 013_security_audit_fixes.sql
-- Fix security audit findings:
--   1. Views with SECURITY DEFINER → SECURITY INVOKER
--   2. Functions with mutable search_path → SET search_path = ''
--   3. Meetings INSERT RLS policy too permissive → require person record

-- ============================================================
-- 1. Recreate views as SECURITY INVOKER
-- ============================================================

-- Drop and recreate current_role_holders
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

-- Drop and recreate circle_stats
DROP VIEW IF EXISTS public.circle_stats;
CREATE VIEW public.circle_stats
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.name,
  c.purpose,
  c.color,
  c.icon,
  c.parent_circle_id,
  count(DISTINCT r.id) AS role_count,
  count(DISTINCT CASE WHEN t.status = ANY (ARRAY['NEW','IN_PROGRESS']) THEN t.id ELSE NULL END) AS open_tensions,
  count(DISTINCT CASE WHEN t.status = 'RESOLVED' THEN t.id ELSE NULL END) AS resolved_tensions
FROM circles c
LEFT JOIN roles r ON c.id = r.circle_id
LEFT JOIN tensions t ON c.id = t.circle_id
GROUP BY c.id, c.name, c.purpose, c.color, c.icon, c.parent_circle_id;

-- Grant access to authenticated users
GRANT SELECT ON public.current_role_holders TO authenticated;
GRANT SELECT ON public.circle_stats TO authenticated;

-- ============================================================
-- 2. Fix function search_path (set to '' to prevent hijacking)
-- ============================================================

-- Recreate update_updated_at_column with fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate get_current_person_id with fixed search_path
-- Must remain SECURITY DEFINER (used in RLS policies)
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.persons WHERE auth_user_id = auth.uid()
$$;

-- Recreate is_admin_or_vorstand with fixed search_path
-- Must remain SECURITY DEFINER (used in RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin_or_vorstand()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.persons
    WHERE auth_user_id = auth.uid()
    AND role IN ('admin', 'vorstand')
  )
$$;

-- ============================================================
-- 3. Tighten meetings INSERT policy
--    Require user to have an associated person record
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create meetings" ON public.meetings;
CREATE POLICY "Authenticated users can create meetings"
  ON public.meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_person_id() IS NOT NULL);
