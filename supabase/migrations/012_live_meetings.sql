-- =====================================================
-- 012: Live Meetings (GlassFrog-Style)
-- =====================================================
-- Erweitert Meetings um Live-Modus mit Phasen,
-- Agenda-Processing, Check-in/Closing Runden und Protokoll.

-- 1. meetings Tabelle erweitern
ALTER TABLE meetings
  ADD COLUMN status TEXT NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED')),
  ADD COLUMN current_phase TEXT
    CHECK (current_phase IN ('CHECK_IN', 'AGENDA', 'CLOSING')),
  ADD COLUMN current_agenda_position INTEGER,
  ADD COLUMN protocol TEXT,
  ADD COLUMN started_at TIMESTAMPTZ,
  ADD COLUMN completed_at TIMESTAMPTZ;

-- 2. meeting_agenda_items erweitern
ALTER TABLE meeting_agenda_items
  ADD COLUMN is_processed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN outcome TEXT,
  ADD COLUMN owner_id UUID REFERENCES persons(id) ON DELETE SET NULL;

-- 3. Neue Tabelle: meeting_round_entries (Check-in / Closing)
CREATE TABLE meeting_round_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('CHECK_IN', 'CLOSING')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, person_id, phase)
);

-- 4. Neue Tabelle: meeting_agenda_comments
CREATE TABLE meeting_agenda_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID REFERENCES meeting_agenda_items(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies

-- meeting_round_entries
ALTER TABLE meeting_round_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read round entries"
  ON meeting_round_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own round entries"
  ON meeting_round_entries FOR INSERT
  TO authenticated
  WITH CHECK (person_id = (SELECT id FROM persons WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own round entries"
  ON meeting_round_entries FOR UPDATE
  TO authenticated
  USING (person_id = (SELECT id FROM persons WHERE auth_user_id = auth.uid()));

-- meeting_agenda_comments
ALTER TABLE meeting_agenda_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read agenda comments"
  ON meeting_agenda_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own agenda comments"
  ON meeting_agenda_comments FOR INSERT
  TO authenticated
  WITH CHECK (person_id = (SELECT id FROM persons WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own agenda comments"
  ON meeting_agenda_comments FOR DELETE
  TO authenticated
  USING (person_id = (SELECT id FROM persons WHERE auth_user_id = auth.uid()));

-- 6. Realtime aktivieren
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_agenda_items;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_round_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_agenda_comments;
