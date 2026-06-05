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

-- Seed tuitions for existing students (HV-2026-001 to HV-2026-010) matching default values
INSERT INTO tuitions (id, student_id, month, status, fee, is_deleted) VALUES
('TUI-042026-HV001', 'HV-2026-001', '04/2026', 'Đã đóng', 400000, FALSE),
('TUI-042026-HV002', 'HV-2026-002', '04/2026', 'Đã đóng', 400000, FALSE),
('TUI-042026-HV003', 'HV-2026-003', '04/2026', 'Chưa đóng', 400000, FALSE),
('TUI-042026-HV004', 'HV-2026-004', '04/2026', 'Đã đóng', 400000, FALSE),
('TUI-042026-HV005', 'HV-2026-005', '04/2026', 'Chưa đóng', 400000, FALSE),

('TUI-052026-HV001', 'HV-2026-001', '05/2026', 'Đã đóng', 400000, FALSE),
('TUI-052026-HV002', 'HV-2026-002', '05/2026', 'Đã đóng', 400000, FALSE),
('TUI-052026-HV003', 'HV-2026-003', '05/2026', 'Đã đóng', 400000, FALSE),
('TUI-052026-HV004', 'HV-2026-004', '05/2026', 'Đã đóng', 400000, FALSE),
('TUI-052026-HV005', 'HV-2026-005', '05/2026', 'Chưa đóng', 400000, FALSE),
('TUI-052026-HV006', 'HV-2026-006', '05/2026', 'Đã đóng', 400000, FALSE),
('TUI-052026-HV007', 'HV-2026-007', '05/2026', 'Chưa đóng', 400000, FALSE),

('TUI-062026-HV001', 'HV-2026-001', '06/2026', 'Chưa đóng', 400000, FALSE),
('TUI-062026-HV002', 'HV-2026-002', '06/2026', 'Đã đóng', 400000, FALSE),
('TUI-062026-HV003', 'HV-2026-003', '06/2026', 'Đã đóng', 400000, FALSE),
('TUI-062026-HV004', 'HV-2026-004', '06/2026', 'Chưa đóng', 400000, FALSE),
('TUI-062026-HV005', 'HV-2026-005', '06/2026', 'Đã đóng', 400000, FALSE),
('TUI-062026-HV006', 'HV-2026-006', '06/2026', 'Chưa đóng', 400000, FALSE),
('TUI-062026-HV007', 'HV-2026-007', '06/2026', 'Đã đóng', 400000, FALSE),
('TUI-062026-HV008', 'HV-2026-008', '06/2026', 'Đã đóng', 400000, FALSE),
('TUI-062026-HV009', 'HV-2026-009', '06/2026', 'Chưa đóng', 400000, FALSE),
('TUI-062026-HV010', 'HV-2026-010', '06/2026', 'Đã đóng', 500000, FALSE);
