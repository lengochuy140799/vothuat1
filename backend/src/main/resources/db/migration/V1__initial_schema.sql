-- Create users table for JWT authentications
CREATE TABLE app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Nam', 'Nữ')),
    birth VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    current_belt VARCHAR(20) NOT NULL CHECK (current_belt IN ('Trắng', 'Vàng', 'Xanh', 'Đỏ', 'Đen')),
    registration_date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create exam sessions table
CREATE TABLE exam_sessions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    date VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create registrations table
CREATE TABLE registrations (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_session_id VARCHAR(50) NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    current_belt VARCHAR(20) NOT NULL,
    target_belt VARCHAR(20) NOT NULL,
    exam_fee NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('PAID', 'UNPAID')),
    payment_date VARCHAR(50),
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance boost
CREATE INDEX idx_registrations_session ON registrations(exam_session_id);
CREATE INDEX idx_registrations_student ON registrations(student_id);

-- Insert a default administrator (password is "admin123" encrypted with BCrypt)
INSERT INTO app_users (username, password, email, role) 
VALUES ('admin', '$2a$10$TqjY2GfeA5a.S6Z9q5J0S.OsnLgD798S7u77lZ51QW9xW5x9X86mG', 'admin@mabudojo.com', 'ADMIN');

-- Seed students (HV-2026-001 through HV-2026-010)
INSERT INTO students (id, name, gender, birth, phone, current_belt, registration_date, created_at) VALUES
('HV-2026-001', 'Nguyễn Minh Khoa', 'Nam', '2015-04-12', '0912345678', 'Trắng', '2026-01-10', NOW() - INTERVAL '120 days'),
('HV-2026-002', 'Lê Quỳnh Anh', 'Nữ', '2016-08-22', '0987654321', 'Vàng', '2025-06-15', NOW() - INTERVAL '150 days'),
('HV-2026-003', 'Trần Tiến Đạt', 'Nam', '2014-11-05', '0905123456', 'Xanh', '2025-02-20', NOW() - INTERVAL '200 days'),
('HV-2026-004', 'Phạm Minh Thư', 'Nữ', '2015-12-30', '0934112233', 'Vàng', '2025-10-05', NOW() - INTERVAL '100 days'),
('HV-2026-005', 'Vũ Hải Đăng', 'Nam', '2013-03-18', '0977889900', 'Đỏ', '2024-05-12', NOW() - INTERVAL '300 days'),
('HV-2026-006', 'Phan Thanh Thảo', 'Nữ', '2016-01-25', '0944556677', 'Trắng', '2026-02-01', NOW() - INTERVAL '80 days'),
('HV-2026-007', 'Hoàng Gia Bảo', 'Nam', '2014-07-14', '0911223344', 'Xanh', '2025-08-18', NOW() - INTERVAL '180 days'),
('HV-2026-008', 'Đỗ Thùy Linh', 'Nữ', '2015-09-09', '0966554433', 'Đỏ', '2024-11-30', NOW() - INTERVAL '250 days'),
('HV-2026-009', 'Bùi Văn Hùng', 'Nam', '2012-10-20', '0922883377', 'Trắng', '2026-03-05', NOW() - INTERVAL '60 days'),
('HV-2026-010', 'Trịnh Quốc Nam', 'Nam', '2013-05-30', '0988776655', 'Đen', '2023-09-10', NOW() - INTERVAL '400 days');

-- Seed exam sessions
INSERT INTO exam_sessions (id, name, date, location, status, created_at) VALUES
('EX-2026-Q1', 'Kỳ thi thăng cấp đai Quý I/2026', '2026-03-25', 'Nhà thi đấu Quận 10, TP.HCM', 'CLOSED', NOW() - INTERVAL '80 days'),
('EX-2026-Q2', 'Kỳ thi thăng cấp đai Quý II/2026', '2026-06-25', 'Sân vận động Quân khu 7, TP.HCM', 'OPEN', NOW() - INTERVAL '10 days'),
('EX-2026-Q3', 'Kỳ thi thăng cấp đai Quý III/2026', '2025-09-25', 'Nhà thiếu nhi Thành phố, TP.HCM', 'CLOSED', NOW() - INTERVAL '260 days');

-- Seed registrations
INSERT INTO registrations (id, student_id, exam_session_id, current_belt, target_belt, exam_fee, payment_status, payment_date, notes, created_at) VALUES
('REG-001', 'HV-2026-001', 'EX-2026-Q2', 'Trắng', 'Vàng', 250000.00, 'PAID', '2026-06-01', 'Đã chuyển khoản Vietcombank', NOW() - INTERVAL '4 days'),
('REG-002', 'HV-2026-002', 'EX-2026-Q2', 'Vàng', 'Xanh', 350000.00, 'UNPAID', NULL, 'Hứa đóng ngày sinh hoạt sau', NOW() - INTERVAL '3 days'),
('REG-003', 'HV-2026-004', 'EX-2026-Q2', 'Vàng', 'Xanh', 350000.00, 'PAID', '2026-06-03', 'Đóng tiền mặt tại võ đường', NOW() - INTERVAL '2 days'),
('REG-004', 'HV-2026-003', 'EX-2026-Q1', 'Xanh', 'Đỏ', 450000.00, 'PAID', '2026-03-10', 'Đã thi đỗ đai Đỏ', NOW() - INTERVAL '80 days'),
('REG-005', 'HV-2026-005', 'EX-2026-Q1', 'Đỏ', 'Đen', 600000.00, 'PAID', '2026-03-12', 'Đóng đợt thi trước', NOW() - INTERVAL '78 days');
