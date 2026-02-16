-- =====================================================
-- TIGHTEN RLS POLICIES
-- Security fix: restrict write operations that were too permissive
-- =====================================================

-- =====================================================
-- VORHABEN: restrict updates to creator/coordinator/admin
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can update vorhaben" ON vorhaben;

CREATE POLICY "Creator or coordinator can update vorhaben"
  ON vorhaben FOR UPDATE
  TO authenticated
  USING (
    created_by = get_current_person_id()
    OR coordinator_id = get_current_person_id()
    OR is_admin_or_vorstand()
  );

-- Restrict vorhaben INSERT to require the creator to be the current user
DROP POLICY IF EXISTS "Authenticated users can create vorhaben" ON vorhaben;

CREATE POLICY "Authenticated users can create own vorhaben"
  ON vorhaben FOR INSERT
  TO authenticated
  WITH CHECK (created_by = get_current_person_id());

-- =====================================================
-- VORHABEN_CIRCLES: restrict to vorhaben creator/coordinator/admin
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage vorhaben_circles" ON vorhaben_circles;
DROP POLICY IF EXISTS "Authenticated users can delete vorhaben_circles" ON vorhaben_circles;

CREATE POLICY "Vorhaben owner can manage vorhaben_circles"
  ON vorhaben_circles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vorhaben v
      WHERE v.id = vorhaben_id
      AND (v.created_by = get_current_person_id()
           OR v.coordinator_id = get_current_person_id()
           OR is_admin_or_vorstand())
    )
  );

CREATE POLICY "Vorhaben owner can delete vorhaben_circles"
  ON vorhaben_circles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vorhaben v
      WHERE v.id = vorhaben_id
      AND (v.created_by = get_current_person_id()
           OR v.coordinator_id = get_current_person_id()
           OR is_admin_or_vorstand())
    )
  );

-- =====================================================
-- SUBTASKS: restrict updates to contact person/creator/vorhaben owner
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can update subtasks" ON subtasks;

CREATE POLICY "Subtask owner or vorhaben owner can update subtasks"
  ON subtasks FOR UPDATE
  TO authenticated
  USING (
    contact_person_id = get_current_person_id()
    OR created_by = get_current_person_id()
    OR EXISTS (
      SELECT 1 FROM vorhaben v
      WHERE v.id = vorhaben_id
      AND (v.created_by = get_current_person_id()
           OR v.coordinator_id = get_current_person_id())
    )
    OR is_admin_or_vorstand()
  );

-- Restrict subtask INSERT to require creator = current user
DROP POLICY IF EXISTS "Authenticated users can create subtasks" ON subtasks;

CREATE POLICY "Authenticated users can create own subtasks"
  ON subtasks FOR INSERT
  TO authenticated
  WITH CHECK (created_by = get_current_person_id());

-- =====================================================
-- SUBTASK_VOLUNTEERS: restrict to own volunteering
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can volunteer" ON subtask_volunteers;
DROP POLICY IF EXISTS "Volunteers can unvolunteer" ON subtask_volunteers;

CREATE POLICY "Users can volunteer themselves"
  ON subtask_volunteers FOR INSERT
  TO authenticated
  WITH CHECK (person_id = get_current_person_id());

CREATE POLICY "Users can unvolunteer themselves"
  ON subtask_volunteers FOR DELETE
  TO authenticated
  USING (person_id = get_current_person_id());

-- =====================================================
-- SUBTASK_COMMENTS: restrict INSERT to own comments
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can create subtask_comments" ON subtask_comments;

CREATE POLICY "Users can create own subtask_comments"
  ON subtask_comments FOR INSERT
  TO authenticated
  WITH CHECK (person_id = get_current_person_id());

-- =====================================================
-- MEETING_ATTENDEES: restrict management to facilitator
-- =====================================================
DROP POLICY IF EXISTS "Meeting attendees can be managed by facilitator" ON meeting_attendees;

CREATE POLICY "Meeting facilitator can manage attendees"
  ON meeting_attendees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id
      AND (m.facilitator_id = get_current_person_id() OR is_admin_or_vorstand())
    )
  );

-- Allow self-registration as attendee
CREATE POLICY "Users can add themselves as attendee"
  ON meeting_attendees FOR INSERT
  TO authenticated
  WITH CHECK (person_id = get_current_person_id());

-- =====================================================
-- MEETING_AGENDA_ITEMS: restrict to facilitator/admin
-- =====================================================
DROP POLICY IF EXISTS "Agenda items can be managed by authenticated users" ON meeting_agenda_items;

CREATE POLICY "Meeting facilitator can manage agenda items"
  ON meeting_agenda_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id
      AND (m.facilitator_id = get_current_person_id() OR is_admin_or_vorstand())
    )
  );

-- =====================================================
-- NOTIFICATIONS: add INSERT/UPDATE/DELETE policies 
-- (currently only SELECT exists, but service client bypasses RLS anyway)
-- Ensure no direct client-side manipulation is possible
-- =====================================================

-- Users can only mark their OWN notifications as read
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (person_id = get_current_person_id());

-- Prevent direct insertion/deletion from client
-- (notifications are created by service-role in server actions)
CREATE POLICY "No direct notification insert"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct notification delete"
  ON notifications FOR DELETE
  TO authenticated
  USING (false);

-- =====================================================
-- VORHABEN: add SELECT policy requiring authenticated role
-- (current policy uses USING(true) without TO authenticated)
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view vorhaben" ON vorhaben;
DROP POLICY IF EXISTS "Anyone can view vorhaben_circles" ON vorhaben_circles;
DROP POLICY IF EXISTS "Anyone can view subtasks" ON subtasks;
DROP POLICY IF EXISTS "Anyone can view subtask_volunteers" ON subtask_volunteers;
DROP POLICY IF EXISTS "Anyone can view subtask_comments" ON subtask_comments;

CREATE POLICY "Authenticated users can view vorhaben"
  ON vorhaben FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view vorhaben_circles"
  ON vorhaben_circles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view subtasks"
  ON subtasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view subtask_volunteers"
  ON subtask_volunteers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view subtask_comments"
  ON subtask_comments FOR SELECT
  TO authenticated
  USING (true);
