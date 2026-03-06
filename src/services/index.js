// src/services/index.js
// ============================================================================
// SERVICES BARREL EXPORT
// Simplifies imports across the app
// ============================================================================

// Import all services
export * from './authService';
export * from './employeeService';
export * from './attendanceService';
export * from './shipmentService';
export * from './expenseService';
export * from './kpiService';
export * from './storageService';

// Usage in components:
// import { getEmployees, getAttendance, login } from '../services';