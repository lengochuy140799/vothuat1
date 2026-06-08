-- Make exam_session_id nullable to support monthly student active registration records
ALTER TABLE registrations ALTER COLUMN exam_session_id DROP NOT NULL;

-- Add month column pointing to the month registration (e.g. "07/2026")
ALTER TABLE registrations ADD COLUMN month VARCHAR(20);
