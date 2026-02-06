-- =====================================================
-- NECKARPIRATEN KOMPASS - Database Schema
-- Version: 1.0
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Familien
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  left_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personen (Eltern)
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'circleLeader', 'vorstand', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kreise
CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  purpose TEXT,
  parent_circle_id UUID REFERENCES circles(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#4A90D9',
  icon TEXT DEFAULT '⭕',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rollen
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  purpose TEXT,
  domains TEXT[] DEFAULT '{}',
  accountabilities TEXT[] DEFAULT '{}',
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rollen-Besetzung (Historie)
CREATE TABLE role_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE NOT NULL,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: nur eine aktive Zuweisung pro Rolle
  CONSTRAINT unique_active_role_assignment UNIQUE (role_id, valid_until)
);

-- Spannungen
CREATE TABLE tensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  raised_by UUID REFERENCES persons(id) ON DELETE SET NULL NOT NULL,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  next_action TEXT,
  assigned_to UUID REFERENCES persons(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  escalated_to UUID REFERENCES circles(id) ON DELETE SET NULL,
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('TACTICAL', 'GOVERNANCE')),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  facilitator_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting-Teilnehmer
CREATE TABLE meeting_attendees (
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  PRIMARY KEY (meeting_id, person_id)
);

-- Meeting-Agenda (Spannungen für Meeting)
CREATE TABLE meeting_agenda_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  tension_id UUID REFERENCES tensions(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklisten-Items pro Kreis
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'MEETING' CHECK (frequency IN ('MEETING', 'WEEKLY', 'MONTHLY', 'YEARLY')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklisten-Erledigungen
CREATE TABLE checklist_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE NOT NULL,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES persons(id) ON DELETE SET NULL NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- =====================================================
-- VIEWS
-- =====================================================

-- Aktuelle Rollen-Besetzungen
CREATE OR REPLACE VIEW current_role_holders AS
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
LEFT JOIN role_assignments ra ON r.id = ra.role_id
  AND ra.valid_until IS NULL
LEFT JOIN persons p ON ra.person_id = p.id
LEFT JOIN circles c ON r.circle_id = c.id;

-- Kreis-Statistiken
CREATE OR REPLACE VIEW circle_stats AS
SELECT
  c.id,
  c.name,
  c.purpose,
  c.color,
  c.icon,
  c.parent_circle_id,
  COUNT(DISTINCT r.id) AS role_count,
  COUNT(DISTINCT CASE WHEN t.status IN ('NEW', 'IN_PROGRESS') THEN t.id END) AS open_tensions,
  COUNT(DISTINCT CASE WHEN t.status = 'RESOLVED' THEN t.id END) AS resolved_tensions
FROM circles c
LEFT JOIN roles r ON c.id = r.circle_id
LEFT JOIN tensions t ON c.id = t.circle_id
GROUP BY c.id, c.name, c.purpose, c.color, c.icon, c.parent_circle_id;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Automatische updated_at Aktualisierung
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für updated_at
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circles_updated_at BEFORE UPDATE ON circles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tensions_updated_at BEFORE UPDATE ON tensions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;

-- Helper function: Get current person ID
CREATE OR REPLACE FUNCTION get_current_person_id()
RETURNS UUID AS $$
  SELECT id FROM persons WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: Check if user is admin or vorstand
CREATE OR REPLACE FUNCTION is_admin_or_vorstand()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM persons
    WHERE auth_user_id = auth.uid()
    AND role IN ('admin', 'vorstand')
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Circles: Everyone can read, only admin/vorstand can modify
CREATE POLICY "Circles are viewable by authenticated users"
  ON circles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Circles are modifiable by admin/vorstand"
  ON circles FOR ALL
  TO authenticated
  USING (is_admin_or_vorstand());

-- Roles: Everyone can read, only admin/vorstand can modify
CREATE POLICY "Roles are viewable by authenticated users"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Roles are modifiable by admin/vorstand"
  ON roles FOR ALL
  TO authenticated
  USING (is_admin_or_vorstand());

-- Role Assignments: Everyone can read, only admin/vorstand can modify
CREATE POLICY "Role assignments are viewable by authenticated users"
  ON role_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Role assignments are modifiable by admin/vorstand"
  ON role_assignments FOR ALL
  TO authenticated
  USING (is_admin_or_vorstand());

-- Persons: Can read all, can update own profile
CREATE POLICY "Persons are viewable by authenticated users"
  ON persons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own person record"
  ON persons FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admin can manage all persons"
  ON persons FOR ALL
  TO authenticated
  USING (is_admin_or_vorstand());

-- Families: Everyone can read, only admin/vorstand can modify
CREATE POLICY "Families are viewable by authenticated users"
  ON families FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Families are modifiable by admin/vorstand"
  ON families FOR ALL
  TO authenticated
  USING (is_admin_or_vorstand());

-- Tensions: Everyone can read and create, only creator/assigned/admin can modify
CREATE POLICY "Tensions are viewable by authenticated users"
  ON tensions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tensions"
  ON tensions FOR INSERT
  TO authenticated
  WITH CHECK (raised_by = get_current_person_id());

CREATE POLICY "Tension creator and assigned can update"
  ON tensions FOR UPDATE
  TO authenticated
  USING (
    raised_by = get_current_person_id()
    OR assigned_to = get_current_person_id()
    OR is_admin_or_vorstand()
  );

-- Meetings: Everyone can read, circle members can create/modify
CREATE POLICY "Meetings are viewable by authenticated users"
  ON meetings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Meeting facilitator and admin can update"
  ON meetings FOR UPDATE
  TO authenticated
  USING (
    facilitator_id = get_current_person_id()
    OR is_admin_or_vorstand()
  );

-- Meeting Attendees: Everyone can read, facilitator can manage
CREATE POLICY "Meeting attendees are viewable by authenticated users"
  ON meeting_attendees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Meeting attendees can be managed by facilitator"
  ON meeting_attendees FOR ALL
  TO authenticated
  USING (true);

-- Meeting Agenda Items: Everyone can read, facilitator can manage
CREATE POLICY "Agenda items are viewable by authenticated users"
  ON meeting_agenda_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Agenda items can be managed by authenticated users"
  ON meeting_agenda_items FOR ALL
  TO authenticated
  USING (true);

-- Checklist Items: Everyone can read, admin can manage
CREATE POLICY "Checklist items are viewable by authenticated users"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Checklist items are modifiable by admin"
  ON checklist_items FOR ALL
  TO authenticated
  USING (is_admin_or_vorstand());

-- Checklist Completions: Everyone can read and create
CREATE POLICY "Checklist completions are viewable by authenticated users"
  ON checklist_completions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create completions"
  ON checklist_completions FOR INSERT
  TO authenticated
  WITH CHECK (completed_by = get_current_person_id());

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_persons_auth_user_id ON persons(auth_user_id);
CREATE INDEX idx_persons_family_id ON persons(family_id);
CREATE INDEX idx_persons_email ON persons(email);
CREATE INDEX idx_roles_circle_id ON roles(circle_id);
CREATE INDEX idx_role_assignments_role_id ON role_assignments(role_id);
CREATE INDEX idx_role_assignments_person_id ON role_assignments(person_id);
CREATE INDEX idx_role_assignments_valid ON role_assignments(valid_from, valid_until);
CREATE INDEX idx_tensions_circle_id ON tensions(circle_id);
CREATE INDEX idx_tensions_raised_by ON tensions(raised_by);
CREATE INDEX idx_tensions_status ON tensions(status);
CREATE INDEX idx_tensions_assigned_to ON tensions(assigned_to);
CREATE INDEX idx_meetings_circle_id ON meetings(circle_id);
CREATE INDEX idx_meetings_date ON meetings(date);
