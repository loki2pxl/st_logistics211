// src/data/mockData.js
// ============================================================================
// MOCK DATA SYSTEM - Seed credentials & profiles
// ============================================================================

export const users = [
  {
    id: "admin-1",
    email: "admin@st.com",
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Nguyễn Văn Admin",
    branch: "hanoi",
    employee_id: "EMP001"
  },
  {
    id: "laixe-1",
    email: "laixe1@st.com",
    username: "laixe1",
    password: "123456",
    role: "laixe",
    name: "Nguyễn Văn Tài",
    branch: "hanoi",
    employee_id: "EMP002"
  },
  {
    id: "bocxep-1",
    email: "bocxep1@st.com",
    username: "bocxep1",
    password: "123456",
    role: "bocxep",
    name: "Trần Thị Kho",
    branch: "hanoi",
    employee_id: "EMP003"
  },
  {
    id: "vanphong-1",
    email: "vanphong1@st.com",
    username: "vanphong1",
    password: "123456",
    role: "vanphong",
    name: "Lê Văn Office",
    branch: "hanoi",
    employee_id: "EMP004"
  }
];

export const mockUsers = {
  admin: users[0],
  driver: users[1],
  warehouse: users[2],
  office: users[3]
};

export const mockEmployees = [
  {
    id: "emp-2",
    employee_id: "EMP002",
    name: "Nguyễn Văn Tài",
    role: "laixe",
    branch: "hanoi",
    status: "active"
  },
  {
    id: "emp-3",
    employee_id: "EMP003",
    name: "Trần Thị Kho",
    role: "bocxep",
    branch: "hanoi",
    status: "active"
  },
  {
    id: "emp-4",
    employee_id: "EMP004",
    name: "Lê Văn Office",
    role: "vanphong",
    branch: "hanoi",
    status: "active"
  }
];

export const mockAttendance = [
  {
    id: 1,
    employee_id: "EMP002",
    employee_name: "Nguyễn Văn Tài",
    group: "laixe",
    branch: "hanoi",
    date: "2026-06-24",
    check_in: "08:00",
    check_out: "17:30"
  },
  {
    id: 2,
    employee_id: "EMP003",
    employee_name: "Trần Thị Kho",
    group: "bocxep",
    branch: "hanoi",
    date: "2026-06-24",
    check_in: "08:15",
    check_out: "17:00"
  },
  {
    id: 3,
    employee_id: "EMP004",
    employee_name: "Lê Văn Office",
    group: "vanphong",
    branch: "hanoi",
    date: "2026-06-24",
    check_in: "08:00",
    check_out: "17:00"
  }
];

export const mockShipments = [
  {
    id: 1,
    order_code: "DH-2026-001",
    customer: "Coca Cola Vietnam",
    date: "2026-06-24",
    status: "delivered",
    branch: "hanoi",
    driver_id: "EMP002",
    driver_name: "Nguyễn Văn Tài",
    vehicle_plate: "VN-29A-12345",
    from_location: "Kho Hà Nội",
    to_location: "Cảng Hải Phòng",
    distance_km: 120,
    total_price: 5000000,
    price: 5000000,
    vehicle: "truck",
    payment_status: "paid"
  },
  {
    id: 2,
    order_code: "DH-2026-002",
    customer: "Unilever Vietnam",
    date: "2026-06-25",
    status: "shipping",
    branch: "hanoi",
    driver_id: "EMP002",
    driver_name: "Nguyễn Văn Tài",
    vehicle_plate: "VN-29A-12345",
    from_location: "Kho Hà Nội",
    to_location: "Bắc Ninh",
    distance_km: 45,
    total_price: 2200000,
    price: 2200000,
    vehicle: "truck",
    payment_status: "unpaid"
  }
];

export const mockExpenses = [
  {
    id: 1,
    employee_id: "EMP002",
    paid_by: "Nguyễn Văn Tài",
    paid_by_employee_id: "EMP002",
    branch: "hanoi",
    date: "2026-06-24",
    type: "fuel",
    amount: 800000,
    description: "Đổ xăng dầu đi Hải Phòng",
    fuel_liters: 40,
    vehicle_plate: "VN-29A-12345",
    order_code: "DH-2026-001",
    approved: true,
    approved_by: "Nguyễn Văn Admin",
    approved_at: "2026-06-24T18:00:00Z"
  },
  {
    id: 2,
    employee_id: "EMP003",
    paid_by: "Trần Thị Kho",
    paid_by_employee_id: "EMP003",
    branch: "hanoi",
    date: "2026-06-24",
    type: "warehouse",
    amount: 350000,
    description: "Mua găng tay bảo hộ lao động",
    approved: false
  }
];