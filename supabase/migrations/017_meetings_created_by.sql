-- Migration 017: Add created_by to meetings
-- Tracks who created the meeting (separate from facilitator)

ALTER TABLE meetings ADD COLUMN created_by UUID REFERENCES persons(id) ON DELETE SET NULL;

-- Backfill: existing meetings use facilitator as creator
UPDATE meetings SET created_by = facilitator_id WHERE created_by IS NULL;
