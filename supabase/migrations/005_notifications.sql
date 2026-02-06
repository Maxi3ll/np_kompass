-- Notifications table for in-app notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'ROLE_ASSIGNED',
    'ROLE_UNASSIGNED',
    'TENSION_CREATED',
    'TENSION_ASSIGNED',
    'TENSION_RESOLVED'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  tension_id UUID REFERENCES tensions(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_notifications_person_unread ON notifications(person_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_person_created ON notifications(person_id, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (person_id = get_current_person_id());
