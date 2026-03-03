-- =====================================================
-- RENAME VORHABEN → PROJEKTE
-- =====================================================

-- =====================================================
-- 1. DROP ALL RLS POLICIES (must happen before table rename)
-- =====================================================

-- vorhaben policies
DROP POLICY IF EXISTS "Authenticated users can view vorhaben" ON vorhaben;
DROP POLICY IF EXISTS "Authenticated users can create own vorhaben" ON vorhaben;
DROP POLICY IF EXISTS "Creator or coordinator can update vorhaben" ON vorhaben;

-- vorhaben_circles policies
DROP POLICY IF EXISTS "Authenticated users can view vorhaben_circles" ON vorhaben_circles;
DROP POLICY IF EXISTS "Vorhaben owner can manage vorhaben_circles" ON vorhaben_circles;
DROP POLICY IF EXISTS "Vorhaben owner can delete vorhaben_circles" ON vorhaben_circles;

-- subtasks policies (reference vorhaben in their body)
DROP POLICY IF EXISTS "Authenticated users can view subtasks" ON subtasks;
DROP POLICY IF EXISTS "Authenticated users can create own subtasks" ON subtasks;
DROP POLICY IF EXISTS "Subtask owner or vorhaben owner can update subtasks" ON subtasks;

-- subtask_volunteers policies
DROP POLICY IF EXISTS "Authenticated users can view subtask_volunteers" ON subtask_volunteers;
DROP POLICY IF EXISTS "Users can volunteer themselves" ON subtask_volunteers;
DROP POLICY IF EXISTS "Users can unvolunteer themselves" ON subtask_volunteers;

-- subtask_comments policies
DROP POLICY IF EXISTS "Authenticated users can view subtask_comments" ON subtask_comments;
DROP POLICY IF EXISTS "Users can create own subtask_comments" ON subtask_comments;
DROP POLICY IF EXISTS "Author can update own subtask_comments" ON subtask_comments;
DROP POLICY IF EXISTS "Author can delete own subtask_comments" ON subtask_comments;

-- =====================================================
-- 2. DROP TRIGGERS (must reference correct table name)
-- =====================================================

DROP TRIGGER IF EXISTS update_vorhaben_updated_at ON vorhaben;

-- =====================================================
-- 3. DROP INDEXES (before table rename)
-- =====================================================

DROP INDEX IF EXISTS idx_vorhaben_coordinator_id;
DROP INDEX IF EXISTS idx_vorhaben_created_by;
DROP INDEX IF EXISTS idx_vorhaben_status;
DROP INDEX IF EXISTS idx_vorhaben_circles_vorhaben_id;
DROP INDEX IF EXISTS idx_vorhaben_circles_circle_id;
DROP INDEX IF EXISTS idx_subtasks_vorhaben_id;

-- =====================================================
-- 4. RENAME TABLES
-- =====================================================

ALTER TABLE vorhaben RENAME TO projekte;
ALTER TABLE vorhaben_circles RENAME TO projekte_circles;

-- =====================================================
-- 5. RENAME FK CONSTRAINTS (for PostgREST hints)
-- =====================================================

ALTER TABLE projekte RENAME CONSTRAINT vorhaben_coordinator_id_fkey TO projekte_coordinator_id_fkey;
ALTER TABLE projekte RENAME CONSTRAINT vorhaben_created_by_fkey TO projekte_created_by_fkey;
ALTER TABLE projekte_circles RENAME CONSTRAINT vorhaben_circles_vorhaben_id_fkey TO projekte_circles_projekt_id_fkey;
ALTER TABLE projekte_circles RENAME CONSTRAINT vorhaben_circles_circle_id_fkey TO projekte_circles_circle_id_fkey;
ALTER TABLE subtasks RENAME CONSTRAINT subtasks_vorhaben_id_fkey TO subtasks_projekt_id_fkey;
ALTER TABLE notifications RENAME CONSTRAINT notifications_vorhaben_id_fkey TO notifications_projekt_id_fkey;

-- Also rename the unique constraint on projekte_circles
ALTER TABLE projekte_circles RENAME CONSTRAINT vorhaben_circles_vorhaben_id_circle_id_key TO projekte_circles_projekt_id_circle_id_key;

-- =====================================================
-- 6. RENAME COLUMNS
-- =====================================================

ALTER TABLE projekte_circles RENAME COLUMN vorhaben_id TO projekt_id;
ALTER TABLE subtasks RENAME COLUMN vorhaben_id TO projekt_id;
ALTER TABLE notifications RENAME COLUMN vorhaben_id TO projekt_id;

-- =====================================================
-- 7. RECREATE INDEXES with new names
-- =====================================================

CREATE INDEX idx_projekte_coordinator_id ON projekte(coordinator_id);
CREATE INDEX idx_projekte_created_by ON projekte(created_by);
CREATE INDEX idx_projekte_status ON projekte(status);
CREATE INDEX idx_projekte_circles_projekt_id ON projekte_circles(projekt_id);
CREATE INDEX idx_projekte_circles_circle_id ON projekte_circles(circle_id);
CREATE INDEX idx_subtasks_projekt_id ON subtasks(projekt_id);

-- =====================================================
-- 8. RECREATE TRIGGER
-- =====================================================

CREATE TRIGGER update_projekte_updated_at BEFORE UPDATE ON projekte
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. RECREATE RLS POLICIES with new names
-- =====================================================

-- projekte policies
CREATE POLICY "Authenticated users can view projekte"
  ON projekte FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create own projekte"
  ON projekte FOR INSERT
  TO authenticated
  WITH CHECK (created_by = get_current_person_id());

CREATE POLICY "Creator or coordinator can update projekte"
  ON projekte FOR UPDATE
  TO authenticated
  USING (
    created_by = get_current_person_id()
    OR coordinator_id = get_current_person_id()
    OR is_admin_or_vorstand()
  );

-- projekte_circles policies
CREATE POLICY "Authenticated users can view projekte_circles"
  ON projekte_circles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Projekt owner can manage projekte_circles"
  ON projekte_circles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projekte p
      WHERE p.id = projekt_id
      AND (p.created_by = get_current_person_id()
           OR p.coordinator_id = get_current_person_id()
           OR is_admin_or_vorstand())
    )
  );

CREATE POLICY "Projekt owner can delete projekte_circles"
  ON projekte_circles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projekte p
      WHERE p.id = projekt_id
      AND (p.created_by = get_current_person_id()
           OR p.coordinator_id = get_current_person_id()
           OR is_admin_or_vorstand())
    )
  );

-- subtasks policies (updated to reference projekte)
CREATE POLICY "Authenticated users can view subtasks"
  ON subtasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create own subtasks"
  ON subtasks FOR INSERT
  TO authenticated
  WITH CHECK (created_by = get_current_person_id());

CREATE POLICY "Subtask owner or projekt owner can update subtasks"
  ON subtasks FOR UPDATE
  TO authenticated
  USING (
    contact_person_id = get_current_person_id()
    OR created_by = get_current_person_id()
    OR EXISTS (
      SELECT 1 FROM projekte p
      WHERE p.id = projekt_id
      AND (p.created_by = get_current_person_id()
           OR p.coordinator_id = get_current_person_id())
    )
    OR is_admin_or_vorstand()
  );

-- subtask_volunteers policies
CREATE POLICY "Authenticated users can view subtask_volunteers"
  ON subtask_volunteers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can volunteer themselves"
  ON subtask_volunteers FOR INSERT
  TO authenticated
  WITH CHECK (person_id = get_current_person_id());

CREATE POLICY "Users can unvolunteer themselves"
  ON subtask_volunteers FOR DELETE
  TO authenticated
  USING (person_id = get_current_person_id());

-- subtask_comments policies
CREATE POLICY "Authenticated users can view subtask_comments"
  ON subtask_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own subtask_comments"
  ON subtask_comments FOR INSERT
  TO authenticated
  WITH CHECK (person_id = get_current_person_id());

CREATE POLICY "Author can update own subtask_comments"
  ON subtask_comments FOR UPDATE
  USING (person_id = get_current_person_id());

CREATE POLICY "Author can delete own subtask_comments"
  ON subtask_comments FOR DELETE
  USING (person_id = get_current_person_id());

-- =====================================================
-- 10. UPDATE NOTIFICATION TYPES: VORHABEN_* → PROJEKT_*
-- =====================================================

-- Update existing notification data
UPDATE notifications SET type = 'PROJEKT_CREATED' WHERE type = 'VORHABEN_CREATED';
UPDATE notifications SET type = 'PROJEKT_VOLUNTEER' WHERE type = 'VORHABEN_VOLUNTEER';
UPDATE notifications SET type = 'PROJEKT_SUBTASK_COMPLETED' WHERE type = 'VORHABEN_SUBTASK_COMPLETED';
UPDATE notifications SET type = 'PROJEKT_COMMENTED' WHERE type = 'VORHABEN_COMMENTED';

-- Update CHECK constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'ROLE_ASSIGNED',
  'ROLE_UNASSIGNED',
  'TENSION_CREATED',
  'TENSION_ASSIGNED',
  'TENSION_RESOLVED',
  'TENSION_COMMENTED',
  'PROJEKT_CREATED',
  'PROJEKT_VOLUNTEER',
  'PROJEKT_SUBTASK_COMPLETED',
  'PROJEKT_COMMENTED'
));
