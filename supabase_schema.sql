-- ============================================================================
-- LOGISTICS MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Paste this script into the Supabase SQL Editor to initialize all tables
-- and seed test data.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- admin, laixe, bocxep, vanphong
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(50) NOT NULL, -- hanoi, saigon
    employee_id VARCHAR(50) UNIQUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- laixe, bocxep, vanphong
    branch VARCHAR(50) NOT NULL, -- hanoi, saigon
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    "group" VARCHAR(50) NOT NULL, -- laixe, bocxep, vanphong
    branch VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    check_in VARCHAR(10) NOT NULL,
    check_out VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
);

-- 5. SHIPMENTS (TRIPS) TABLE
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(100) UNIQUE NOT NULL,
    customer VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, shipping, delivered
    branch VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50),
    driver_name VARCHAR(255),
    vehicle_plate VARCHAR(50),
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    distance_km NUMERIC(10, 2) DEFAULT 0.00,
    work_days NUMERIC(5, 2) DEFAULT 1.00,
    price NUMERIC(15, 2) DEFAULT 0.00,
    total_price NUMERIC(15, 2) DEFAULT 0.00,
    vehicle VARCHAR(50) DEFAULT 'truck',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    paid_by VARCHAR(255) NOT NULL,
    paid_by_employee_id VARCHAR(50) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL, -- fuel, warehouse, office, utilities, maintenance, other
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    invoice_urls TEXT[] DEFAULT '{}',
    fuel_liters NUMERIC(10, 2),
    vehicle_plate VARCHAR(50),
    order_code VARCHAR(100),
    approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. WORK REPORTS TABLE (For Loaders / BocXep)
CREATE TABLE IF NOT EXISTS work_reports (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    container_count INTEGER DEFAULT 0,
    total_weight NUMERIC(10, 2) DEFAULT 0.00,
    cargo_type VARCHAR(100),
    work_area VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_loader_date UNIQUE (employee_id, date)
);

-- 8. KPI & SALARY TABLE
CREATE TABLE IF NOT EXISTS kpi (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    month VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    score NUMERIC(5, 2) DEFAULT 100.00,
    base_salary NUMERIC(15, 2) DEFAULT 0.00,
    bonus NUMERIC(15, 2) DEFAULT 0.00,
    deductions NUMERIC(15, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_employee_month UNIQUE (employee_id, month)
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed Users
INSERT INTO users (username, email, password, role, name, branch, employee_id) VALUES
('admin', 'admin@st.com', 'admin123', 'admin', 'Nguyễn Văn Admin', 'hanoi', 'EMP001')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password, role, name, branch, employee_id) VALUES
('laixe1', 'laixe1@st.com', '123456', 'laixe', 'Nguyễn Văn Tài', 'hanoi', 'EMP002')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password, role, name, branch, employee_id) VALUES
('bocxep1', 'bocxep1@st.com', '123456', 'bocxep', 'Trần Thị Kho', 'hanoi', 'EMP003')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password, role, name, branch, employee_id) VALUES
('vanphong1', 'vanphong1@st.com', '123456', 'vanphong', 'Lê Văn Office', 'hanoi', 'EMP004')
ON CONFLICT (username) DO NOTHING;

-- Seed Employees
INSERT INTO employees (employee_id, name, role, branch, status) VALUES
('EMP002', 'Nguyễn Văn Tài', 'laixe', 'hanoi', 'active'),
('EMP003', 'Trần Thị Kho', 'bocxep', 'hanoi', 'active'),
('EMP004', 'Lê Văn Office', 'vanphong', 'hanoi', 'active')
ON CONFLICT (employee_id) DO NOTHING;

-- Seed Shipments (DH/ORD)
INSERT INTO shipments (order_code, customer, date, status, branch, driver_id, driver_name, vehicle_plate, from_location, to_location, distance_km, total_price) VALUES
('DH-2026-001', 'Coca Cola Vietnam', '2026-06-24', 'delivered', 'hanoi', 'EMP002', 'Nguyễn Văn Tài', 'VN-29A-12345', 'Kho Hà Nội', 'Cảng Hải Phòng', 120.00, 5000000.00),
('DH-2026-002', 'Unilever Vietnam', '2026-06-25', 'shipping', 'hanoi', 'EMP002', 'Nguyễn Văn Tài', 'VN-29A-12345', 'Kho Hà Nội', 'Bắc Ninh', 45.00, 2200000.00)
ON CONFLICT (order_code) DO NOTHING;

-- Seed Expenses
INSERT INTO expenses (employee_id, paid_by, paid_by_employee_id, branch, date, type, amount, description, fuel_liters, vehicle_plate, order_code, approved) VALUES
('EMP002', 'Nguyễn Văn Tài', 'EMP002', 'hanoi', '2026-06-24', 'fuel', 800000.00, 'Đổ xăng dầu đi Hải Phòng', 40.00, 'VN-29A-12345', 'DH-2026-001', TRUE),
('EMP003', 'Trần Thị Kho', 'EMP003', 'hanoi', '2026-06-24', 'warehouse', 350000.00, 'Mua găng tay bảo hộ lao động', NULL, NULL, NULL, FALSE)
ON CONFLICT DO NOTHING;

-- Seed Attendance
INSERT INTO attendance (employee_id, employee_name, "group", branch, date, check_in, check_out) VALUES
('EMP002', 'Nguyễn Văn Tài', 'laixe', 'hanoi', '2026-06-24', '08:00', '17:30'),
('EMP003', 'Trần Thị Kho', 'bocxep', 'hanoi', '2026-06-24', '08:15', '17:00'),
('EMP004', 'Lê Văn Office', 'vanphong', 'hanoi', '2026-06-24', '08:00', '17:00')
ON CONFLICT (employee_id, date) DO NOTHING;

-- Seed Loaders reports
INSERT INTO work_reports (employee_id, employee_name, branch, date, container_count, total_weight, cargo_type, work_area) VALUES
('EMP003', 'Trần Thị Kho', 'hanoi', '2026-06-24', 4, 25.50, 'Hàng tiêu dùng', 'Kho B')
ON CONFLICT (employee_id, date) DO NOTHING;

-- Seed KPIs
INSERT INTO kpi (employee_id, branch, month, score, base_salary, bonus, deductions, notes) VALUES
('EMP002', 'hanoi', '2026-06', 95.00, 12000000.00, 1500000.00, 200000.00, 'Chuyến đi an toàn, đúng giờ'),
('EMP003', 'hanoi', '2026-06', 90.00, 9000000.00, 800000.00, 0.00, 'Làm việc năng suất tốt'),
('EMP004', 'hanoi', '2026-06', 100.00, 10000000.00, 1200000.00, 0.00, 'Báo cáo chi phí và sổ sách chính xác')
ON CONFLICT (employee_id, month) DO NOTHING;
