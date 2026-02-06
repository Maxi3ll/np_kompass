-- =====================================================
-- ALLOWED EMAILS - Allowlist for login access
-- =====================================================

CREATE TABLE allowed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read (needed for auth checks in-app)
CREATE POLICY "Allowed emails readable by authenticated"
  ON allowed_emails FOR SELECT
  TO authenticated
  USING (true);

-- Only admin/vorstand can insert, update, delete
CREATE POLICY "Admin can insert allowed emails"
  ON allowed_emails FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_vorstand());

CREATE POLICY "Admin can update allowed emails"
  ON allowed_emails FOR UPDATE
  TO authenticated
  USING (is_admin_or_vorstand());

CREATE POLICY "Admin can delete allowed emails"
  ON allowed_emails FOR DELETE
  TO authenticated
  USING (is_admin_or_vorstand());

-- Index for fast email lookups
CREATE INDEX idx_allowed_emails_email ON allowed_emails(email);

-- Seed: Admin-E-Mail
INSERT INTO allowed_emails (email, added_by)
VALUES ('hello@max-blum.com', 'migration');
