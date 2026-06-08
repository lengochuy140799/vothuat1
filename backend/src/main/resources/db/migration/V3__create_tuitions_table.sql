-- Create tuitions table
CREATE TABLE tuitions (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Đã đóng', 'Chưa đóng')),
    fee NUMERIC(12, 2) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique index
CREATE UNIQUE INDEX idx_tuitions_student_month ON tuitions(student_id, month);

-- Seed tuitions for existing students (VS-2026-001 to VS-2026-010) matching default values
INSERT INTO tuitions (id, student_id, month, status, fee, is_deleted)
SELECT 'TUI-042026-' || REPLACE(id, 'VS-2026-', 'VS'), id, '04/2026', 'Đã đóng', 400000, FALSE
FROM students WHERE id IN ('VS-2026-001', 'VS-2026-002', 'VS-2026-004');

INSERT INTO tuitions (id, student_id, month, status, fee, is_deleted)
SELECT 'TUI-042026-' || REPLACE(id, 'VS-2026-', 'VS'), id, '04/2026', 'Chưa đóng', 400000, FALSE
FROM students WHERE id IN ('VS-2026-003', 'VS-2026-005');

INSERT INTO tuitions (id, student_id, month, status, fee, is_deleted)
SELECT 'TUI-052026-' || REPLACE(id, 'VS-2026-', 'VS'), id, '05/2026', 'Đã đóng', 400000, FALSE
FROM students WHERE id IN ('VS-2026-001', 'VS-2026-002', 'VS-2026-003', 'VS-2026-004', 'VS-2026-006');

INSERT INTO tuitions (id, student_id, month, status, fee, is_deleted)
SELECT 'TUI-052026-' || REPLACE(id, 'VS-2026-', 'VS'), id, '05/2026', 'Chưa đóng', 400000, FALSE
FROM students WHERE id IN ('VS-2026-005', 'VS-2026-007');

INSERT INTO tuitions (id, student_id, month, status, fee, is_deleted)
SELECT 'TUI-062026-' || REPLACE(id, 'VS-2026-', 'VS'), id, '06/2026', 'Chưa đóng', 400000, FALSE
FROM students WHERE id IN ('VS-2026-001', 'VS-2026-004', 'VS-2026-006', 'VS-2026-009');

INSERT INTO tuitions (id, student_id, month, status, fee, is_deleted)
SELECT 'TUI-062026-' || REPLACE(id, 'VS-2026-', 'VS'), id, '06/2026', 'Đã đóng', 400000, FALSE
FROM students WHERE id IN ('VS-2026-002', 'VS-2026-003', 'VS-2026-005', 'VS-2026-007', 'VS-2026-008');

INSERT INTO tuitions (id, student_id, month, status, fee, is_deleted)
SELECT 'TUI-062026-' || REPLACE(id, 'VS-2026-', 'VS'), id, '06/2026', 'Đã đóng', 500000, FALSE
FROM students WHERE id IN ('VS-2026-010');
