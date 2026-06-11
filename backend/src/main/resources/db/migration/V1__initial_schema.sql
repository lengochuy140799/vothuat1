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
    current_belt VARCHAR(20) NOT NULL CHECK (current_belt IN ('Đen', 'Xanh', 'Xanh 1', 'Xanh 2', 'Xanh 3', 'Đỏ', 'Đỏ 1', 'Đỏ 2', 'Đỏ 3', 'Vàng', 'Vàng 1', 'Vàng 2', 'Vàng 3', 'Vàng 4', 'Trắng', 'Đen Xanh')),
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

-- Seed students (VS-2026-001 through VS-2026-010)
INSERT INTO students (id, name, gender, birth, phone, current_belt, registration_date, created_at) VALUES
('VS-2026-001', 'Nguyễn Văn Hải', 'Nam', '2010-04-12', '0912345678', 'Trắng', '2026-01-10', NOW() - INTERVAL '120 days'),
('VS-2026-002', 'Lê Minh Tuấn', 'Nam', '2012-08-25', '0987654321', 'Vàng', '2026-01-15', NOW() - INTERVAL '150 days'),
('VS-2026-003', 'Trần Thị Hồng', 'Nữ', '2011-02-05', '0905556667', 'Xanh', '2026-01-18', NOW() - INTERVAL '200 days'),
('VS-2026-004', 'Phạm Quốc Bảo', 'Nam', '2009-11-30', '0934112233', 'Đỏ', '2026-01-20', NOW() - INTERVAL '100 days'),
('VS-2026-005', 'Hoàng Gia Huy', 'Nam', '2013-05-14', '0977224466', 'Trắng', '2026-01-22', NOW() - INTERVAL '300 days'),
('VS-2026-006', 'Vũ Phương Linh', 'Nữ', '2011-09-08', '0911889900', 'Trắng', '2026-01-25', NOW() - INTERVAL '80 days'),
('VS-2026-007', 'Đặng Tiến Dũng', 'Nam', '2008-01-15', '0944005511', 'Vàng', '2026-01-28', NOW() - INTERVAL '180 days'),
('VS-2026-008', 'Bùi Minh Tâm', 'Nam', '2014-06-19', '0966334455', 'Xanh', '2026-02-02', NOW() - INTERVAL '250 days'),
('VS-2026-009', 'Phan Thanh Trúc', 'Nữ', '2012-10-10', '0988112244', 'Đỏ', '2026-02-05', NOW() - INTERVAL '60 days'),
('VS-2026-010', 'Nguyễn Hữu Đạt', 'Nam', '2010-12-01', '0909556644', 'Đen', '2026-02-12', NOW() - INTERVAL '400 days');

-- Seed exam sessions
INSERT INTO exam_sessions (id, name, date, location, status, created_at) VALUES
('EX-2026-Q1', 'Kỳ thi thăng cấp đai Quý I/2026', '2026-03-25', 'Nhà thi đấu Quận 10, TP.HCM', 'CLOSED', NOW() - INTERVAL '80 days'),
('EX-2026-Q2', 'Kỳ thi thăng cấp đai Quý II/2026', '2026-06-25', 'Sân vận động Quân khu 7, TP.HCM', 'OPEN', NOW() - INTERVAL '10 days'),
('EX-2026-Q3', 'Kỳ thi thăng cấp đai Quý III/2026', '2025-09-25', 'Nhà thiếu nhi Thành phố, TP.HCM', 'CLOSED', NOW() - INTERVAL '260 days');

-- Seed registrations
INSERT INTO registrations (id, student_id, exam_session_id, current_belt, target_belt, exam_fee, payment_status, payment_date, notes, created_at) VALUES
('REG-001', 'VS-2026-001', 'EX-2026-Q2', 'Trắng', 'Vàng', 250000.00, 'PAID', '2026-06-01', 'Đã chuyển khoản Vietcombank', NOW() - INTERVAL '4 days'),
('REG-002', 'VS-2026-002', 'EX-2026-Q2', 'Vàng', 'Xanh', 350000.00, 'UNPAID', NULL, 'Hứa đóng ngày sinh hoạt sau', NOW() - INTERVAL '3 days'),
('REG-003', 'VS-2026-004', 'EX-2026-Q2', 'Vàng', 'Xanh', 350000.00, 'PAID', '2026-06-03', 'Đóng tiền mặt tại võ đường', NOW() - INTERVAL '2 days'),
('REG-004', 'VS-2026-003', 'EX-2026-Q1', 'Xanh', 'Đỏ', 450000.00, 'PAID', '2026-03-10', 'Đã thi đỗ đai Đỏ', NOW() - INTERVAL '80 days'),
('REG-005', 'VS-2026-005', 'EX-2026-Q1', 'Đỏ', 'Đen', 600000.00, 'PAID', '2026-03-12', 'Đóng đợt thi trước', NOW() - INTERVAL '78 days');
