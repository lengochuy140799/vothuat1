-- Add unique constraint to prevent duplicate registrations for same student in same exam session
ALTER TABLE registrations ADD CONSTRAINT unique_student_exam_session UNIQUE (student_id, exam_session_id);
