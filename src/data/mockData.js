export const users = [
  {
    id: 1,
    email: "admin@test.com",
    password: "admin123",
    role: "admin",
    name: "Test Admin"
  },
  {
    id: 2,
    email: "user@test.com",
    password: "user123",
    role: "user",
    name: "Test User"
  }
]

export const posts = [
  {
    id: 1,
    title: "Test Post",
    content: "This is mock content"
  }
]

export const mockUsers = {
  admin: {
    id: 1,
    name: "Admin Test",
    role: "admin",
    branch: "hanoi"
  },

  driver: {
    id: 2,
    employee_id: 2,
    name: "Nguyen Van Tai",
    role: "lai-xe",
    branch: "hanoi"
  },

  warehouse: {
    id: 3,
    employee_id: 3,
    name: "Tran Thi Kho",
    role: "boc-xep",
    branch: "hanoi"
  },

  office: {
    id: 4,
    employee_id: 4,
    name: "Le Van Office",
    role: "van-phong",
    branch: "hanoi"
  }
};
export const mockEmployees = [
  {
    id: 1,
    name: "Nguyen Van Tai",
    role: "lai-xe",
    branch: "hanoi"
  },
  {
    id: 2,
    name: "Tran Thi Kho",
    role: "boc-xep",
    branch: "hanoi"
  },
  {
    id: 3,
    name: "Le Van Office",
    role: "van-phong",
    branch: "hanoi"
  }
];
export const mockAttendance = [
  {
    id: 1,
    employee_id: 2,
    employee_name: "Nguyen Van Tai",
    date: "2026-03-06",
    check_in: "08:00",
    check_out: "17:30"
  },
  {
    id: 2,
    employee_id: 3,
    employee_name: "Tran Thi Kho",
    date: "2026-03-06",
    check_in: "08:15",
    check_out: null
  }
];
export const mockShipments = [
  {
    id: 1,
    order_code: "ORD001",
    customer: "Coca Cola Vietnam",
    date: "2026-03-06",
    status: "pending",
    branch: "hanoi"
  },
  {
    id: 2,
    order_code: "ORD002",
    customer: "Unilever",
    date: "2026-03-05",
    status: "shipping",
    branch: "hanoi"
  }
];
export const mockExpenses = [
  {
    id: 1,
    date: "2026-03-05",
    type: "fuel",
    amount: 500000,
    description: "Đổ xăng xe tải",
    paid_by: "Nguyen Van Tai"
  },
  {
    id: 2,
    date: "2026-03-04",
    type: "warehouse",
    amount: 200000,
    description: "Mua pallet",
    paid_by: "Tran Thi Kho"
  }
];