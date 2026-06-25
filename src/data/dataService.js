// src/data/dataService.js
// ============================================================================
// MOCK DATA SERVICE WITH COORDINATIONS & LOCAL STORAGE SYNCHRONIZATION
// ============================================================================

import {
  users as initialUsers,
  mockEmployees as initialEmployees,
  mockAttendance as initialAttendance,
  mockShipments as initialShipments,
  mockExpenses as initialExpenses,
  mockCoordinations as initialCoordinations
} from "./mockData";

// LocalStorage Keys
const KEY_USERS = "st_logistics_users";
const KEY_EMPLOYEES = "st_logistics_employees";
const KEY_ATTENDANCE = "st_logistics_attendance";
const KEY_SHIPMENTS = "st_logistics_shipments";
const KEY_EXPENSES = "st_logistics_expenses";
const KEY_WORK_REPORTS = "st_logistics_work_reports";
const KEY_COORDINATIONS = "st_logistics_coordinations";
const KEY_KPI = "st_logistics_kpi";

// Helper to load or initialize
const getStoredData = async (key, defaultValue) => {
  try {
    const res = await fetch(`http://localhost:3001/api/data?key=${key}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn(`Local database server is offline. Falling back to localStorage for key: ${key}`);
  }

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
const saveStoredData = async (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  try {
    await fetch(`http://localhost:3001/api/data?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.warn(`Failed to sync to local database server for key: ${key}`, e);
  }
};

// Helper to auto-merge initial seed elements if they are missing from LocalStorage (cache prevention)
const getStoredDataMerged = async (key, defaultValue, idField = 'id') => {
  const stored = await getStoredData(key, defaultValue);
  if (!Array.isArray(stored)) return stored;
  const storedIds = new Set(stored.map(item => item && item[idField]));
  const missing = defaultValue.filter(item => !storedIds.has(item[idField]));
  if (missing.length > 0) {
    const updated = [...stored, ...missing];
    await saveStoredData(key, updated);
    return updated;
  }
  return stored;
};

// Initialize Mock database in LocalStorage
const getMockUsers = async () => await getStoredDataMerged(KEY_USERS, initialUsers, 'id');
const getMockEmployees = async () => await getStoredDataMerged(KEY_EMPLOYEES, initialEmployees, 'employee_id');
const getMockAttendance = async () => await getStoredDataMerged(KEY_ATTENDANCE, initialAttendance, 'id');
const getMockShipments = async () => await getStoredDataMerged(KEY_SHIPMENTS, initialShipments, 'order_code');
const getMockExpenses = async () => await getStoredDataMerged(KEY_EXPENSES, initialExpenses, 'id');
const getMockCoordinations = async () => await getStoredDataMerged(KEY_COORDINATIONS, initialCoordinations, 'id');

const getMockWorkReports = async () => await getStoredData(KEY_WORK_REPORTS, [
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

const getMockKPIs = async () => await getStoredData(KEY_KPI, [
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
  },
  {
    id: 4,
    employee_id: "EMP005",
    branch: "hanoi",
    month: "2026-06",
    score: 95,
    base_salary: 11000000,
    bonus: 1000000,
    deductions: 0,
    notes: "Điều phối toa hàng đúng hạn"
  }
]);

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function login(emailOrUsername, password) {
  const usersList = await getMockUsers();
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
  await saveStoredData(KEY_USERS, updatedUsers);

  return user;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getEmployees(branch) {
  const list = await getMockEmployees();
  if (branch) return list.filter(e => e.branch === branch);
  return list;
}

export async function getAttendance(branch, date) {
  let list = await getMockAttendance();
  if (branch) list = list.filter(a => a.branch === branch);
  if (date) list = list.filter(a => a.date === date);
  return list;
}

export async function getTodayAttendance(employeeId) {
  const today = new Date().toISOString().split("T")[0];
  const list = await getMockAttendance();
  return list.find(a => a.employee_id === employeeId && a.date === today) || null;
}

export async function getEmployeeHistory(employeeId, days = 7) {
  const list = await getMockAttendance();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(a => a.employee_id === employeeId && a.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getShipments(branch) {
  const list = await getMockShipments();
  if (branch) return list.filter(s => s.branch === branch);
  return list;
}

export async function getDriverShipments(driverId, days = 7) {
  const list = await getMockShipments();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(s => s.driver_id === driverId && s.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getExpenses(branch) {
  const list = await getMockExpenses();
  if (branch) return list.filter(e => e.branch === branch);
  return list;
}

export async function getExpensesByEmployee(employeeId) {
  const list = await getMockExpenses();
  return list.filter(e => e.paid_by_employee_id === employeeId || e.employee_id === employeeId);
}

export async function getEmployeeExpenses(employeeId, days = 7) {
  const list = await getMockExpenses();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(e => (e.paid_by_employee_id === employeeId || e.employee_id === employeeId) && e.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getWorkReports(employeeId, days = 7) {
  const list = await getMockWorkReports();
  if (!employeeId) return list;
  
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(r => r.employee_id === employeeId && r.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getCoordinations(branch) {
  // Return all coordinations for mock testing, since hanoi has coordinations by coordinator
  const list = await getMockCoordinations();
  return list;
}

export async function getCoordinatorLogs(coordinatorId, days = 7) {
  const list = await getMockCoordinations();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  const limitStr = limitDate.toISOString().split("T")[0];

  return list
    .filter(c => c.coordinator_id === coordinatorId && c.date >= limitStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getKPI(branch) {
  const list = await getMockKPIs();
  if (branch) return list.filter(k => k.branch === branch);
  return list;
}

export async function getKPIByEmployeeMonth(employeeId, month) {
  const list = await getMockKPIs();
  return list.find(k => k.employee_id === employeeId && k.month === month) || null;
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function addAttendance(record) {
  const list = await getMockAttendance();
  const today = new Date().toISOString().split("T")[0];
  
  // Check if check_in or update check_out
  const existingIndex = list.findIndex(a => a.employee_id === record.employee_id && a.date === today);
  
  if (existingIndex > -1) {
    // Update check out
    list[existingIndex] = {
      ...list[existingIndex],
      check_out: record.check_out || list[existingIndex].check_out
    };
    await saveStoredData(KEY_ATTENDANCE, list);
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
    await saveStoredData(KEY_ATTENDANCE, list);
    return newRecord;
  }
}

export async function updateAttendanceCheckout(attendanceId, checkOutTime) {
  const list = await getMockAttendance();
  const index = list.findIndex(a => a.id === parseInt(attendanceId));
  if (index > -1) {
    list[index].check_out = checkOutTime;
    await saveStoredData(KEY_ATTENDANCE, list);
    return list[index];
  }
  throw new Error("Attendance record not found");
}

export async function addShipment(shipment) {
  const list = await getMockShipments();
  const newShipment = {
    id: list.length + 1,
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    work_days: 1,
    price: shipment.price || shipment.total_price || 0,
    total_price: shipment.total_price || shipment.price || 0,
    oil_charge: shipment.oil_charge || 0,
    toll_gate_fee: shipment.toll_gate_fee || 0,
    vehicle: "truck",
    payment_status: "unpaid",
    ...shipment
  };
  list.push(newShipment);
  await saveStoredData(KEY_SHIPMENTS, list);
  return newShipment;
}

export async function addExpense(expense) {
  const list = await getMockExpenses();
  const newExpense = {
    id: list.length + 1,
    date: expense.date || new Date().toISOString().split("T")[0],
    approved: false,
    ...expense
  };
  list.push(newExpense);
  await saveStoredData(KEY_EXPENSES, list);
  return newExpense;
}

export async function approveExpense(id, approvedBy) {
  const list = await getMockExpenses();
  const index = list.findIndex(e => e.id === parseInt(id));
  if (index > -1) {
    list[index].approved = true;
    list[index].approved_by = approvedBy;
    list[index].approved_at = new Date().toISOString();
    await saveStoredData(KEY_EXPENSES, list);
    return list[index];
  }
  throw new Error("Expense record not found");
}

export async function addWorkReport(report) {
  const list = await getMockWorkReports();
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
  
  await saveStoredData(KEY_WORK_REPORTS, list);
  return newReport;
}

export async function addCoordination(coord) {
  const list = await getMockCoordinations();
  const newCoord = {
    id: list.length + 1,
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    ...coord
  };
  list.push(newCoord);
  await saveStoredData(KEY_COORDINATIONS, list);
  return newCoord;
}

export async function updateCoordinationStatus(id, status) {
  const list = await getMockCoordinations();
  const index = list.findIndex(c => c.id === parseInt(id));
  if (index > -1) {
    list[index].status = status;
    await saveStoredData(KEY_COORDINATIONS, list);
    return list[index];
  }
  throw new Error("Coordination record not found");
}

export async function upsertKPI(kpiData) {
  const list = await getMockKPIs();
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

  await saveStoredData(KEY_KPI, list);
  return record;
}