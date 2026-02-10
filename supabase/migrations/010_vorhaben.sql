-- =====================================================
-- DROP OLD TASKS TABLES
-- =====================================================

-- Remove task_id column from notifications first
ALTER TABLE notifications DROP COLUMN IF EXISTS task_id;

-- Drop old task tables (CASCADE to handle FK references)
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Delete old TASK_* notifications that would violate the new constraint
DELETE FROM notifications WHERE type LIKE 'TASK_%';

-- Clean up old notification type constraint (remove TASK_* types)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- =====================================================
-- VORHABEN (Initiatives)
-- =====================================================

CREATE TABLE vorhaben (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE')),
  start_date DATE,
  end_date DATE,
  coordinator_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  created_by UUID REFERENCES persons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VORHABEN_CIRCLES (n:m Junction)
-- =====================================================

CREATE TABLE vorhaben_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vorhaben_id UUID REFERENCES vorhaben(id) ON DELETE CASCADE NOT NULL,
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(vorhaben_id, circle_id)
);

-- =====================================================
-- SUBTASKS (Unteraufgaben)
-- =====================================================

CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vorhaben_id UUID REFERENCES vorhaben(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE')),
  contact_person_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  created_by UUID REFERENCES persons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBTASK_VOLUNTEERS (Helfer)
-- =====================================================

CREATE TABLE subtask_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id UUID REFERENCES subtasks(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subtask_id, person_id)
);

-- =====================================================
-- SUBTASK_COMMENTS (Kommentare)
-- =====================================================

CREATE TABLE subtask_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id UUID REFERENCES subtasks(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_vorhaben_updated_at BEFORE UPDATE ON vorhaben
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtask_comments_updated_at BEFORE UPDATE ON subtask_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_vorhaben_coordinator_id ON vorhaben(coordinator_id);
CREATE INDEX idx_vorhaben_created_by ON vorhaben(created_by);
CREATE INDEX idx_vorhaben_status ON vorhaben(status);
CREATE INDEX idx_vorhaben_circles_vorhaben_id ON vorhaben_circles(vorhaben_id);
CREATE INDEX idx_vorhaben_circles_circle_id ON vorhaben_circles(circle_id);
CREATE INDEX idx_subtasks_vorhaben_id ON subtasks(vorhaben_id);
CREATE INDEX idx_subtasks_contact_person_id ON subtasks(contact_person_id);
CREATE INDEX idx_subtasks_created_by ON subtasks(created_by);
CREATE INDEX idx_subtasks_status ON subtasks(status);
CREATE INDEX idx_subtask_volunteers_subtask_id ON subtask_volunteers(subtask_id);
CREATE INDEX idx_subtask_volunteers_person_id ON subtask_volunteers(person_id);
CREATE INDEX idx_subtask_comments_subtask_id ON subtask_comments(subtask_id);
CREATE INDEX idx_subtask_comments_person_id ON subtask_comments(person_id);

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE vorhaben ENABLE ROW LEVEL SECURITY;
ALTER TABLE vorhaben_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtask_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtask_comments ENABLE ROW LEVEL SECURITY;

-- Vorhaben: everyone can read
CREATE POLICY "Anyone can view vorhaben"
  ON vorhaben FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create vorhaben"
  ON vorhaben FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update vorhaben"
  ON vorhaben FOR UPDATE USING (true);

-- Vorhaben circles: everyone can read
CREATE POLICY "Anyone can view vorhaben_circles"
  ON vorhaben_circles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage vorhaben_circles"
  ON vorhaben_circles FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can delete vorhaben_circles"
  ON vorhaben_circles FOR DELETE USING (true);

-- Subtasks: everyone can read
CREATE POLICY "Anyone can view subtasks"
  ON subtasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create subtasks"
  ON subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update subtasks"
  ON subtasks FOR UPDATE USING (true);

-- Subtask volunteers: everyone can read
CREATE POLICY "Anyone can view subtask_volunteers"
  ON subtask_volunteers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can volunteer"
  ON subtask_volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "Volunteers can unvolunteer"
  ON subtask_volunteers FOR DELETE USING (true);

-- Subtask comments: everyone can read
CREATE POLICY "Anyone can view subtask_comments"
  ON subtask_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create subtask_comments"
  ON subtask_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Author can update own subtask_comments"
  ON subtask_comments FOR UPDATE USING (person_id = get_current_person_id());
CREATE POLICY "Author can delete own subtask_comments"
  ON subtask_comments FOR DELETE USING (person_id = get_current_person_id());

-- =====================================================
-- EXTEND NOTIFICATIONS FOR VORHABEN
-- =====================================================

ALTER TABLE notifications ADD COLUMN vorhaben_id UUID REFERENCES vorhaben(id) ON DELETE CASCADE;

-- Add new notification type constraint with vorhaben types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'ROLE_ASSIGNED',
  'ROLE_UNASSIGNED',
  'TENSION_CREATED',
  'TENSION_ASSIGNED',
  'TENSION_RESOLVED',
  'VORHABEN_CREATED',
  'VORHABEN_VOLUNTEER',
  'VORHABEN_SUBTASK_COMPLETED',
  'VORHABEN_COMMENTED'
));
