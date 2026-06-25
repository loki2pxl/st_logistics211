// src/data/dataService.js
// ============================================================================
// MOCK DATA SERVICE WITH LOCAL STORAGE SYNCHRONIZATION
// ============================================================================

import {
  users as initialUsers,
  mockEmployees as initialEmployees,
  mockAttendance as initialAttendance,
  mockShipments as initialShipments,
  mockExpenses as initialExpenses
} from "./mockData";

// LocalStorage Keys
const KEY_USERS = "st_logistics_users";
const KEY_EMPLOYEES = "st_logistics_employees";
const KEY_ATTENDANCE = "st_logistics_attendance";
const KEY_SHIPMENTS = "st_logistics_shipments";
const KEY_EXPENSES = "st_logistics_expenses";
const KEY_WORK_REPORTS = "st_logistics_work_reports";
const KEY_KPI = "st_logistics_kpi";

// Helper to load or initialize
const getStoredData = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
};

// Helper to save data
const saveStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize Mock database in LocalStorage
const getMockUsers = () => getStoredData(KEY_USERS, initialUsers);
const getMockEmployees = () => getStoredData(KEY_EMPLOYEES, initialEmployees);
const getMockAttendance = () => getStoredData(KEY_ATTENDANCE, initialAttendance);
const getMockShipments = () => getStoredData(KEY_SHIPMENTS, initialShipments);
const getMockExpenses = () => getStoredData(KEY_EXPENSES, initialExpenses);

const getMockWorkReports = () => getStoredData(KEY_WORK_REPORTS, [
  {
    id: 1,
    employee_id: "EMP003",
    employee_name: "Trần Thị Kho",
    branch: "hanoi",
    date: "2026-06-24",
    container_count: 4,
    total_weight: 25.5,
    cargo_type: "Hàng tiêu dùng",
    work_area: "Kho B",
    notes: ""
  }
]);

const getMockKPIs = () => getStoredData(KEY_KPI, [
  {
    id: 1,
    employee_id: "EMP002",
    branch: "hanoi",
    month: "2026-06",
    score: 95,
    base_salary: 12000000,
    bonus: 1500000,
    deductions: 200000,
    notes: "Chuyến đi an toàn, đúng giờ"
  },
  {
    id: 2,
    employee_id: "EMP003",
    branch: "hanoi",
    month: "2026-06",
    score: 90,
    base_salary: 9000000,
    bonus: 800000,
    deductions: 0,
    notes: "Làm việc năng suất tốt"
  },
  {
    id: 3,
    employee_id: "EMP004",
    branch: "hanoi",
    month: "2026-06",
    score: 100,
    base_salary: 10000000,
    bonus: 1200000,
    deductions: 0,
    notes: "Báo cáo chi phí chính xác"
  }
]);

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function login(emailOrUsername, password) {
  const usersList = getMockUsers();
  const lowerInput = emailOrUsername.toLowerCase();
  
  const user = usersList.find(
    (u) => 
      (u.email.toLowerCase() === lowerInput || u.username.toLowerCase() === lowerInput) && 
      u.password === password
  );

  if (!user) {
    throw new Error("Tên đăng nhập/email hoặc mật khẩu không đúng");
  }

  // Update last login
  const updatedUsers = usersList.map(u => 
    u.id === user.id ? { ...u, last_login: new Date().toISOString() } : u
  );
  saveStoredData(KEY_USERS, updatedUsers);

  return user;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getEmployees(branch) {
  const list = getMockEmployees();
  if (branch) return list.filter(e => e.branch === branch);
  return list;
}

export async function getAttendance(branch, date) {
  let list = getMockAttendance();
  if (branch) list = list.filter(a => a.branch === branch);
  if (date) list = list.filter(a => a.date === date);
  return list;
}

export async function getTodayAttendance(employeeId) {
  const today = new Date().toISOString().split("T")[0];
  const list = getMockAttendance();
  return list.find(a => a.employee_id === employeeId && a.date === today) || null;
}

export async function getEmployeeHistory(employeeId, days = 7) {
  const list = getMockAttendance();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(a => a.employee_id === employeeId && a.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getShipments(branch) {
  const list = getMockShipments();
  if (branch) return list.filter(s => s.branch === branch);
  return list;
}

export async function getDriverShipments(driverId, days = 7) {
  const list = getMockShipments();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(s => s.driver_id === driverId && s.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getExpenses(branch) {
  const list = getMockExpenses();
  if (branch) return list.filter(e => e.branch === branch);
  return list;
}

export async function getExpensesByEmployee(employeeId) {
  const list = getMockExpenses();
  return list.filter(e => e.paid_by_employee_id === employeeId || e.employee_id === employeeId);
}

export async function getEmployeeExpenses(employeeId, days = 7) {
  const list = getMockExpenses();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(e => (e.paid_by_employee_id === employeeId || e.employee_id === employeeId) && e.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getWorkReports(employeeId, days = 7) {
  const list = getMockWorkReports();
  if (!employeeId) return list;
  
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(r => r.employee_id === employeeId && r.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getKPI(branch) {
  const list = getMockKPIs();
  if (branch) return list.filter(k => k.branch === branch);
  return list;
}

export async function getKPIByEmployeeMonth(employeeId, month) {
  const list = getMockKPIs();
  return list.find(k => k.employee_id === employeeId && k.month === month) || null;
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function addAttendance(record) {
  const list = getMockAttendance();
  const today = new Date().toISOString().split("T")[0];
  
  // Check if check_in or update check_out
  const existingIndex = list.findIndex(a => a.employee_id === record.employee_id && a.date === today);
  
  if (existingIndex > -1) {
    // Update check out
    list[existingIndex] = {
      ...list[existingIndex],
      check_out: record.check_out || list[existingIndex].check_out
    };
    saveStoredData(KEY_ATTENDANCE, list);
    return list[existingIndex];
  } else {
    // Insert new check_in
    const newRecord = {
      id: list.length + 1,
      date: today,
      check_in: record.check_in,
      check_out: null,
      ...record
    };
    list.push(newRecord);
    saveStoredData(KEY_ATTENDANCE, list);
    return newRecord;
  }
}

export async function updateAttendanceCheckout(attendanceId, checkOutTime) {
  const list = getMockAttendance();
  const index = list.findIndex(a => a.id === parseInt(attendanceId));
  if (index > -1) {
    list[index].check_out = checkOutTime;
    saveStoredData(KEY_ATTENDANCE, list);
    return list[index];
  }
  throw new Error("Attendance record not found");
}

export async function addShipment(shipment) {
  const list = getMockShipments();
  const newShipment = {
    id: list.length + 1,
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    work_days: 1,
    price: shipment.price || shipment.total_price || 0,
    total_price: shipment.total_price || shipment.price || 0,
    vehicle: "truck",
    payment_status: "unpaid",
    ...shipment
  };
  list.push(newShipment);
  saveStoredData(KEY_SHIPMENTS, list);
  return newShipment;
}

export async function addExpense(expense) {
  const list = getMockExpenses();
  const newExpense = {
    id: list.length + 1,
    date: expense.date || new Date().toISOString().split("T")[0],
    approved: false,
    ...expense
  };
  list.push(newExpense);
  saveStoredData(KEY_EXPENSES, list);
  return newExpense;
}

export async function approveExpense(id, approvedBy) {
  const list = getMockExpenses();
  const index = list.findIndex(e => e.id === parseInt(id));
  if (index > -1) {
    list[index].approved = true;
    list[index].approved_by = approvedBy;
    list[index].approved_at = new Date().toISOString();
    saveStoredData(KEY_EXPENSES, list);
    return list[index];
  }
  throw new Error("Expense record not found");
}

export async function addWorkReport(report) {
  const list = getMockWorkReports();
  const today = new Date().toISOString().split("T")[0];
  
  // Upsert on employee_id + date
  const index = list.findIndex(r => r.employee_id === report.employee_id && r.date === today);
  const newReport = {
    id: index > -1 ? list[index].id : list.length + 1,
    date: today,
    container_count: parseInt(report.container_count) || 0,
    total_weight: parseFloat(report.total_weight) || 0,
    cargo_type: report.cargo_type || "Khác",
    work_area: report.work_area || "Chung",
    notes: report.notes || "",
    ...report
  };

  if (index > -1) {
    list[index] = newReport;
  } else {
    list.push(newReport);
  }
  
  saveStoredData(KEY_WORK_REPORTS, list);
  return newReport;
}

export async function upsertKPI(kpiData) {
  const list = getMockKPIs();
  const index = list.findIndex(k => k.employee_id === kpiData.employee_id && k.month === kpiData.month);
  
  const record = {
    id: index > -1 ? list[index].id : list.length + 1,
    ...kpiData
  };

  if (index > -1) {
    list[index] = record;
  } else {
    list.push(record);
  }

  saveStoredData(KEY_KPI, list);
  return record;
}