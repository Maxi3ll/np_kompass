-- Allow multiple persons to hold the same role simultaneously
-- Drop the old constraint that only allowed one active holder per role
ALTER TABLE role_assignments DROP CONSTRAINT unique_active_role_assignment;

-- Add new constraint: same person cannot be assigned to the same role twice at the same time
ALTER TABLE role_assignments ADD CONSTRAINT unique_person_role_assignment UNIQUE (role_id, person_id, valid_until);
