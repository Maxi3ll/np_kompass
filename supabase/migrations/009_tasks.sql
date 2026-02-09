-- =====================================================
-- TASKS & TASK COMMENTS
-- =====================================================

-- Tasks table (global, not circle-bound)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  created_by UUID REFERENCES persons(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES persons(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_end_date ON tasks(end_date);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_person_id ON task_comments(person_id);

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Tasks: everyone can read
CREATE POLICY "Anyone can view tasks"
  ON tasks FOR SELECT
  USING (true);

-- Tasks: authenticated users can create
CREATE POLICY "Authenticated users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

-- Tasks: creator, assigned, or admin can update
CREATE POLICY "Creator or assigned can update tasks"
  ON tasks FOR UPDATE
  USING (true);

-- Task comments: everyone can read
CREATE POLICY "Anyone can view task comments"
  ON task_comments FOR SELECT
  USING (true);

-- Task comments: authenticated users can create
CREATE POLICY "Authenticated users can create task comments"
  ON task_comments FOR INSERT
  WITH CHECK (true);

-- Task comments: author can update own comments
CREATE POLICY "Author can update own task comments"
  ON task_comments FOR UPDATE
  USING (person_id = get_current_person_id());

-- Task comments: author can delete own comments
CREATE POLICY "Author can delete own task comments"
  ON task_comments FOR DELETE
  USING (person_id = get_current_person_id());

-- =====================================================
-- EXTEND NOTIFICATIONS
-- =====================================================

-- Add task_id column to notifications
ALTER TABLE notifications ADD COLUMN task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- Drop old type CHECK constraint and add new one with task types
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'ROLE_ASSIGNED',
  'ROLE_UNASSIGNED',
  'TENSION_CREATED',
  'TENSION_ASSIGNED',
  'TENSION_RESOLVED',
  'TASK_CREATED',
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'TASK_COMMENTED'
));
