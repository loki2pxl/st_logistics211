import {
  users,
  mockUsers,
  mockEmployees,
  mockAttendance,
  mockShipments,
  mockExpenses
} from "./mockData";

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

/**
 * Validates credentials against the mock users list
 * @param {string} email - Standardized to email for both UI components
 * @param {string} password 
 */
export async function login(email, password) {
  // 1. Find the user in the mock database
  // We use .toLowerCase() to make login case-insensitive
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  // 2. Map the base user to their full mock profile structure
  // This ensures the App has the full 'branch', 'full_name', etc.
  let fullProfile;
  switch (user.role) {
    case "admin":
      fullProfile = mockUsers.admin;
      break;
    case "driver":
      fullProfile = mockUsers.driver;
      break;
    case "warehouse":
      fullProfile = mockUsers.warehouse;
      break;
    case "office":
      fullProfile = mockUsers.office;
      break;
    default:
      fullProfile = user;
  }

  return fullProfile;
}

// ============================================================================
// DATA FETCHING SERVICES (Read)
// ============================================================================

export async function getEmployees() {
  return mockEmployees;
}

export async function getAttendance() {
  return mockAttendance;
}

export async function getShipments() {
  return mockShipments;
}

export async function getExpenses() {
  return mockExpenses;
}

// ============================================================================
// MOCK CREATE FUNCTIONS (Write)
// ============================================================================

export async function addShipment(shipment) {
  const newShipment = {
    id: Date.now(),
    created_at: new Date().toISOString(),
    ...shipment
  };
  mockShipments.push(newShipment);
  return newShipment;
}

export async function addExpense(expense) {
  const newExpense = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    ...expense
  };
  mockExpenses.push(newExpense);
  return newExpense;
}

export async function addAttendance(record) {
  const newRecord = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    ...record
  };
  mockAttendance.push(newRecord);
  return newRecord;
}

// NOTE: We do NOT use "export default" here. 
// This allows you to import only what you need: import { login, getShipments } from '...'