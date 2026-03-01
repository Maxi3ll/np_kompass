-- =====================================================
-- TENSION COMMENTS
-- =====================================================

CREATE TABLE tension_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tension_id UUID REFERENCES tensions(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_tension_comments_updated_at BEFORE UPDATE ON tension_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_tension_comments_tension_id ON tension_comments(tension_id);
CREATE INDEX idx_tension_comments_person_id ON tension_comments(person_id);

-- RLS
ALTER TABLE tension_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tension_comments"
  ON tension_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tension_comments"
  ON tension_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Author can update own tension_comments"
  ON tension_comments FOR UPDATE USING (person_id = get_current_person_id());
CREATE POLICY "Author can delete own tension_comments"
  ON tension_comments FOR DELETE USING (person_id = get_current_person_id());

-- =====================================================
-- EXTEND NOTIFICATIONS FOR TENSION_COMMENTED
-- =====================================================

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'ROLE_ASSIGNED',
  'ROLE_UNASSIGNED',
  'TENSION_CREATED',
  'TENSION_ASSIGNED',
  'TENSION_RESOLVED',
  'TENSION_COMMENTED',
  'VORHABEN_CREATED',
  'VORHABEN_VOLUNTEER',
  'VORHABEN_SUBTASK_COMPLETED',
  'VORHABEN_COMMENTED'
));
