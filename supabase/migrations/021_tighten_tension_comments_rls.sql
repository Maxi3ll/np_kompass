-- Migration 021: Tighten RLS on tension_comments
-- Reason: Migration 014 created policies without TO authenticated and with
-- WITH CHECK (true), which would let any caller with the public anon key
-- insert comments impersonating any person via direct REST API calls.
-- Brings tension_comments in line with subtask_comments (migration 011/015).

DROP POLICY IF EXISTS "Anyone can view tension_comments" ON tension_comments;
DROP POLICY IF EXISTS "Authenticated users can create tension_comments" ON tension_comments;
DROP POLICY IF EXISTS "Author can update own tension_comments" ON tension_comments;
DROP POLICY IF EXISTS "Author can delete own tension_comments" ON tension_comments;

CREATE POLICY "Authenticated can view tension_comments"
  ON tension_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own tension_comments"
  ON tension_comments FOR INSERT
  TO authenticated
  WITH CHECK (person_id = get_current_person_id());

CREATE POLICY "Author can update own tension_comments"
  ON tension_comments FOR UPDATE
  TO authenticated
  USING (person_id = get_current_person_id());

CREATE POLICY "Author can delete own tension_comments"
  ON tension_comments FOR DELETE
  TO authenticated
  USING (person_id = get_current_person_id());
